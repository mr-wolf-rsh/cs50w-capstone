from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from smart_selects.db_fields import ChainedForeignKey

import pgtrigger

from colorfield.fields import ColorField

from functools import partial
from uuid import uuid4

from .managers import *


def image_upload_wrapper(instance, filename, dirname):
    ext = filename.split('.')[-1]
    new_filename = f'{instance.uuid}.{ext}'
    from os import path
    return path.join(dirname, new_filename)


class User(AbstractUser):
    username = None
    email = models.EmailField(_('email address'), unique=True)

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ('email',)
        db_table = 'user'

    def __str__(self):
        return f'{self.email}'


class Voter(models.Model):
    uuid = models.UUIDField(
        default=uuid4, editable=False, unique=True)
    user = models.OneToOneField(to='User',
                                on_delete=models.CASCADE,
                                related_name='voter')
    voters_interested = models.ManyToManyField(to='PoliticalInterest',
                                               through='VoterInterest',
                                               related_name='+')
    voters_polled = models.ManyToManyField(to='Campaign',
                                           through='Poll',
                                           related_name='+')
    color = ColorField(default='#36AA7B')

    class Meta:
        verbose_name = 'Voter'
        verbose_name_plural = 'Voters'
        ordering = ('user',)
        db_table = 'voter'

    def __str__(self):
        return str(self.user)


@pgtrigger.register(
    pgtrigger.Trigger(
        name='period_pre_insert',
        level=pgtrigger.Statement,
        when=pgtrigger.Before,
        operation=pgtrigger.Insert,
        func=f'''
            UPDATE period
            SET is_current = FALSE
            WHERE is_current = TRUE;
            RETURN NULL;
        '''
    )
)
class Period(models.Model):
    uuid = models.UUIDField(
        default=uuid4, editable=False, unique=True)
    year_start = models.SmallIntegerField()
    year_end = models.SmallIntegerField()
    is_current = models.BooleanField(default=True)
    election_periods = models.ManyToManyField(to='ElectionType',
                                              through='ElectionPeriod',
                                              related_name='+')

    class Meta:
        verbose_name = 'Period'
        verbose_name_plural = 'Periods'
        db_table = 'period'

    def __str__(self):
        return f'{self.year_start}-{self.year_end}'


class Country(models.Model):
    geocode = models.CharField(max_length=3, primary_key=True)
    code = models.CharField(max_length=3)
    iso_3 = models.CharField(max_length=3)
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = 'Country'
        verbose_name_plural = 'Countries'
        ordering = ('code',)
        db_table = 'country'

    def __str__(self):
        return f'{self.name}'


class State(models.Model):
    geocode = models.CharField(max_length=5, primary_key=True)
    code = models.CharField(max_length=2)
    name = models.CharField(max_length=100)
    country = models.ForeignKey(to='Country',
                                null=True,
                                on_delete=models.SET_NULL,
                                related_name='states')

    class Meta:
        verbose_name = 'State'
        verbose_name_plural = 'States'
        ordering = ('code',)
        db_table = 'state'

    def __str__(self):
        return f'{self.name}'


class City(models.Model):
    geocode = models.CharField(max_length=7, primary_key=True)
    code = models.CharField(max_length=2)
    name = models.CharField(max_length=100)
    country = models.ForeignKey(to='Country',
                                null=True,
                                on_delete=models.SET_NULL,
                                related_name='cities')
    state = ChainedForeignKey(to='State',
                              null=True,
                              on_delete=models.SET_NULL,
                              related_name='cities',
                              chained_field='country',
                              chained_model_field='country',
                              show_all=False,
                              auto_choose=True,
                              sort=True)

    class Meta:
        verbose_name = 'City'
        verbose_name_plural = 'Cities'
        ordering = ('code',)
        db_table = 'city'

    def __str__(self):
        return f'{self.name}'


class District(models.Model):
    geocode = models.CharField(max_length=10, primary_key=True)
    code = models.CharField(max_length=3)
    name = models.CharField(max_length=100)
    country = models.ForeignKey(to='Country',
                                null=True,
                                on_delete=models.SET_NULL,
                                related_name='districts')
    state = ChainedForeignKey(to='State',
                              null=True,
                              on_delete=models.SET_NULL,
                              related_name='districts',
                              chained_field='country',
                              chained_model_field='country',
                              show_all=False,
                              auto_choose=True,
                              sort=True)
    city = ChainedForeignKey(to='City',
                             null=True,
                             on_delete=models.SET_NULL,
                             related_name='districts',
                             chained_field='state',
                             chained_model_field='state',
                             show_all=False,
                             auto_choose=True,
                             sort=True)

    class Meta:
        verbose_name = 'District'
        verbose_name_plural = 'Districts'
        ordering = ('code',)
        db_table = 'district'

    def __str__(self):
        return f'{self.name}'


class ElectionType(models.Model):
    class Elections(models.TextChoices):
        PRESIDENTIAL = 'PR', _('Presidential')
        CONGRESSIONAL = 'CG', _('Congressional')
        PARLIAMENTARY = 'PL', _('Parliamentary')
        REGIONAL = 'RG', _('Regional')
        MAYORAL = 'MY', _('Mayoral')

    uuid = models.UUIDField(
        default=uuid4, editable=False, unique=True)
    type = models.CharField(max_length=50,
                            choices=Elections.choices)
    image = models.ImageField(upload_to=partial(image_upload_wrapper, dirname='election-type'),
                              null=True,
                              default=None)

    class Meta:
        verbose_name = 'Election type'
        verbose_name_plural = 'Election types'
        db_table = 'election_type'

    def __str__(self):
        return self.get_type_display()


class ElectionPeriod(models.Model):
    uuid = models.UUIDField(
        default=uuid4, editable=False, unique=True)
    period = models.ForeignKey(to='Period',
                               to_field='uuid',
                               null=True,
                               on_delete=models.SET_NULL,
                               related_name='election_period')
    election_type = models.ForeignKey(to='ElectionType',
                                      to_field='uuid',
                                      null=True,
                                      on_delete=models.SET_NULL,
                                      related_name='election_period')

    class Meta:
        verbose_name = 'Election period'
        verbose_name_plural = 'Election periods'
        db_table = 'election_period'

    def __str__(self):
        return f'{self.election_type} {self.period}'


class PoliticalSpectrum(models.Model):
    class Spectrum(models.TextChoices):
        FAR_LEFT = 'FL', _('Far-left')
        CENTER_LEFT = 'CL', _('Centre-left')
        RADICAL_CENTRE = 'RC', _('Radical centre')
        CENTRE_RIGHT = 'CR', _('Centre-right')
        FAR_RIGHT = 'FR', _('Far-right')

    uuid = models.UUIDField(
        default=uuid4, editable=False, unique=True)
    spectrum = models.CharField(max_length=50,
                                choices=Spectrum.choices)

    class Meta:
        verbose_name = 'Political spectrum'
        verbose_name_plural = 'Political spectrum'
        db_table = 'political_spectrum'

    def __str__(self):
        return self.get_spectrum_display()


class PoliticalIdeology(models.Model):
    uuid = models.UUIDField(
        default=uuid4, editable=False, unique=True)
    ideology = models.CharField(max_length=100)

    class Meta:
        verbose_name = 'Political ideology'
        verbose_name_plural = 'Political ideologies'
        db_table = 'political_ideology'

    def __str__(self):
        return f'{self.ideology}'


class PoliticalInterest(models.Model):
    class Interests(models.TextChoices):
        HEALTHCARE = 'HC', _('Healthcare')
        EDUCATION = 'ED', _('Education')
        SECURITY = 'SC', _('Security')
        ECONOMICS = 'EC', _('Economics')
        CONST_REFORMS = 'RF', _('Const. Reforms')
        SOCIAL_RIGHTS = 'SR', _('Social Rights')

    uuid = models.UUIDField(
        default=uuid4, editable=False, unique=True)
    interest = models.CharField(max_length=50,
                                choices=Interests.choices)

    class Meta:
        verbose_name = 'Political interest'
        verbose_name_plural = 'Political interests'
        db_table = 'political_interest'

    def __str__(self):
        return self.get_interest_display()


class PersonLike(models.Model):
    voter = models.ForeignKey(to='Voter',
                              to_field='uuid',
                              on_delete=models.CASCADE,
                              related_name='+')

    class Meta:
        abstract = True


class PersonRating(PersonLike):
    value = models.FloatField(default=0,
                              validators=[
                                  MaxValueValidator(5),
                                  MinValueValidator(0)
                              ])

    class Meta:
        abstract = True


class CandidateLike(PersonLike):
    candidate = models.ForeignKey(to='Candidate',
                                  to_field='uuid',
                                  on_delete=models.CASCADE,
                                  related_name='candidate_likes')

    class Meta:
        verbose_name = 'Candidate like'
        verbose_name_plural = 'Candidate likes'
        db_table = 'candidate_like'

    def __str__(self):
        return f'{self.candidate} - {self.voter}'


class CandidateRating(PersonRating):
    candidate = models.ForeignKey(to='Candidate',
                                  to_field='uuid',
                                  on_delete=models.CASCADE,
                                  related_name='candidate_rating')

    class Meta:
        verbose_name = 'Candidate rating'
        verbose_name_plural = 'Candidate rating'
        db_table = 'candidate_rating'

    def __str__(self):
        return f'{self.candidate} - {self.voter}: {self.value}'


class PartyLike(PersonLike):
    party = models.ForeignKey(to='Party',
                              to_field='uuid',
                              on_delete=models.CASCADE,
                              related_name='party_likes')

    class Meta:
        verbose_name = 'Party like'
        verbose_name_plural = 'Party likes'
        db_table = 'party_like'

    def __str__(self):
        return f'{self.party} - {self.voter}'


class PartyRating(PersonRating):
    party = models.ForeignKey(to='Party',
                              to_field='uuid',
                              on_delete=models.CASCADE,
                              related_name='party_rating')

    class Meta:
        verbose_name = 'Party rating'
        verbose_name_plural = 'Party rating'
        db_table = 'party_rating'

    def __str__(self):
        return f'{self.party} - {self.voter}: {self.value}'


class PartyIdeology(models.Model):
    party = models.ForeignKey(to='Party',
                              to_field='uuid',
                              on_delete=models.CASCADE,
                              related_name='party_ideologies')
    political_ideology = models.ForeignKey(to='PoliticalIdeology',
                                           to_field='uuid',
                                           on_delete=models.CASCADE,
                                           related_name='party_ideologies')

    class Meta:
        verbose_name = 'Party ideology'
        verbose_name_plural = 'Party ideologies'
        db_table = 'party_ideology'

    def __str__(self):
        return f'{self.party} - {self.political_ideology}'


class Party(models.Model):
    uuid = models.UUIDField(
        default=uuid4, editable=False, unique=True)
    name = models.CharField(max_length=100)
    primary_color = ColorField(default='#ffffff')
    secondary_color = ColorField(default='#000000')
    logo = models.ImageField(upload_to=partial(image_upload_wrapper, dirname='party/logo'),
                             null=True,
                             default=None)
    background = models.TextField(blank=True)
    leader = models.CharField(max_length=100)
    government_plan = models.URLField(blank=True, null=True)
    country = models.ForeignKey(to='Country',
                                null=True,
                                on_delete=models.SET_NULL,
                                related_name='parties')
    state = ChainedForeignKey(to='State',
                              null=True,
                              on_delete=models.SET_NULL,
                              related_name='parties',
                              chained_field='country',
                              chained_model_field='country',
                              show_all=False,
                              auto_choose=True,
                              sort=True)
    spectrum = models.ForeignKey(to='PoliticalSpectrum',
                                 to_field='uuid',
                                 null=True,
                                 on_delete=models.SET_NULL,
                                 related_name='parties')
    ideologies = models.ManyToManyField(to='PoliticalIdeology',
                                        through='PartyIdeology',
                                        related_name='+')
    foundation_date = models.DateField()
    banner = models.ImageField(upload_to=partial(image_upload_wrapper, dirname='party/banner'),
                               null=True,
                               default=None)
    liked_by = models.ManyToManyField(to='Voter',
                                      through='PartyLike',
                                      related_name='+')
    rated_by = models.ManyToManyField(to='Voter',
                                      through='PartyRating',
                                      related_name='+')

    class Meta:
        verbose_name = 'Party'
        verbose_name_plural = 'Parties'
        db_table = 'party'
        ordering = ('id',)

    def __str__(self):
        return f'{self.name}'


class Candidate(models.Model):
    uuid = models.UUIDField(
        default=uuid4, editable=False, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    image = models.ImageField(upload_to=partial(image_upload_wrapper, dirname='candidate'),
                              null=True,
                              default=None)
    background = models.TextField(blank=True)
    country = models.ForeignKey(to='Country',
                                null=True,
                                on_delete=models.SET_NULL,
                                related_name='candidates')
    state = ChainedForeignKey(to='State',
                              null=True,
                              on_delete=models.SET_NULL,
                              related_name='candidates',
                              chained_field='country',
                              chained_model_field='country',
                              show_all=False,
                              auto_choose=True,
                              sort=True)
    city = ChainedForeignKey(to='City',
                             null=True,
                             blank=True,
                             on_delete=models.SET_NULL,
                             related_name='candidates',
                             chained_field='state',
                             chained_model_field='state',
                             show_all=False,
                             auto_choose=True,
                             sort=True)
    district = ChainedForeignKey(to='District',
                                 null=True,
                                 blank=True,
                                 on_delete=models.SET_NULL,
                                 related_name='candidates',
                                 chained_field='city',
                                 chained_model_field='city',
                                 show_all=False,
                                 auto_choose=True,
                                 sort=True)

    birthday = models.DateField()
    career = models.CharField(max_length=100, null=True)
    last_job = models.CharField(max_length=100)
    party = models.ForeignKey(to='Party',
                              to_field='uuid',
                              null=True,
                              on_delete=models.SET_NULL,
                              related_name='candidates')
    candidates_interested = models.ManyToManyField(to='PoliticalInterest',
                                                   through='CandidateInterest',
                                                   related_name='+')
    liked_by = models.ManyToManyField(to='Voter',
                                      through='CandidateLike',
                                      related_name='+')
    rated_by = models.ManyToManyField(to='Voter',
                                      through='CandidateRating',
                                      related_name='+')

    class Meta:
        verbose_name = 'Candidate'
        verbose_name_plural = 'Candidates'
        db_table = 'candidate'
        ordering = ('last_name',)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'


class Campaign(models.Model):
    class TicketType(models.TextChoices):
        MAIN = 'MN', _('Main')
        VICE_1 = 'V1', _('Vice 1')
        VICE_2 = 'V2', _('Vice 2')
    uuid = models.UUIDField(
        default=uuid4, editable=False, unique=True)
    country = models.ForeignKey(to='Country',
                                null=True,
                                on_delete=models.SET_NULL,
                                related_name='campaigns')
    state = ChainedForeignKey(to='State',
                              null=True,
                              blank=True,
                              on_delete=models.SET_NULL,
                              related_name='campaigns',
                              chained_field='country',
                              chained_model_field='country',
                              show_all=False,
                              auto_choose=True,
                              sort=True)
    city = ChainedForeignKey(to='City',
                             null=True,
                             blank=True,
                             on_delete=models.SET_NULL,
                             related_name='campaigns',
                             chained_field='state',
                             chained_model_field='state',
                             show_all=False,
                             auto_choose=True,
                             sort=True)
    district = ChainedForeignKey(to='District',
                                 null=True,
                                 blank=True,
                                 on_delete=models.SET_NULL,
                                 related_name='campaigns',
                                 chained_field='city',
                                 chained_model_field='city',
                                 show_all=False,
                                 auto_choose=True,
                                 sort=True)
    candidate = models.ForeignKey(to='Candidate',
                                  to_field='uuid',
                                  on_delete=models.CASCADE,
                                  related_name='campaigns')
    election_period = models.ForeignKey(to='ElectionPeriod',
                                        to_field='uuid',
                                        on_delete=models.CASCADE,
                                        related_name='campaigns')
    ticket_type = models.CharField(max_length=10,
                                   default=TicketType.MAIN,
                                   choices=TicketType.choices)

    class Meta:
        verbose_name = 'Campaign'
        verbose_name_plural = 'Campaigns'
        db_table = 'campaign'
        ordering = ('candidate',)

    def __str__(self):
        return f'{self.candidate} | {self.election_period}'


class PersonInterest(models.Model):
    political_interest = models.ForeignKey(to='PoliticalInterest',
                                           to_field='uuid',
                                           on_delete=models.CASCADE,
                                           related_name='+')
    value = models.PositiveSmallIntegerField(default=0,
                                             validators=[
                                                 MaxValueValidator(10),
                                                 MinValueValidator(0)
                                             ])

    class Meta:
        abstract = True


class VoterInterest(PersonInterest):
    voter = models.ForeignKey(to='Voter',
                              to_field='uuid',
                              on_delete=models.CASCADE,
                              related_name='voter_interests')

    class Meta:
        verbose_name = 'Voter interest'
        verbose_name_plural = 'Voter interests'
        db_table = 'voter_interest'

    def __str__(self):
        return f'{self.voter} - {self.political_interest}'


class CandidateInterest(PersonInterest):
    candidate = models.ForeignKey(to='Candidate',
                                  to_field='uuid',
                                  on_delete=models.CASCADE,
                                  related_name='candidate_interests')

    class Meta:
        verbose_name = 'Candidate interest'
        verbose_name_plural = 'Candidate interests'
        db_table = 'candidate_interest'

    def __str__(self):
        return f'{self.candidate} - {self.political_interest}'


class Poll(models.Model):
    campaign = models.ForeignKey(to='Campaign',
                                 to_field='uuid',
                                 on_delete=models.CASCADE,
                                 related_name='polls')
    voter = models.ForeignKey(to='Voter',
                              to_field='uuid',
                              null=True,
                              on_delete=models.SET_NULL,
                              related_name='polls')
    timecode = models.CharField(max_length=14,
                                editable=False,
                                null=True)
    created_at = models.DateField(default=timezone.now)

    class Meta:
        verbose_name = 'Poll'
        verbose_name_plural = 'Polls'
        db_table = 'poll'

    def save(self, *args, **kwargs):
        self.timecode = self.created_at.strftime('%Y%U')
        super(Poll, self).save(*args, **kwargs)

    def __str__(self):
        return f'Poll {self.timecode} - {self.voter} - {self.campaign}'
