from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from django.utils.html import format_html

from .models import *


def get_color_panel(color_attribute):
    def inner_func(obj):
        color = getattr(obj, color_attribute)
        return format_html('<div title="{0}" style="width: 40px;height: 20px;border-radius: 2px;background-color: {0};"></div>', color)
    return inner_func


def get_location(foreign=None):
    def inner_func(obj):
        attr = getattr(obj, foreign) if foreign else obj
        return f'{attr.code} - {attr.name}'
    return inner_func


def get_label(description, callable):
    return admin.display(description=description, function=callable)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (get_label('Full Name', lambda obj: f'{obj.first_name} {obj.last_name}'),
                    'email', 'is_active', 'date_joined', 'last_login')

    list_filter = ('is_staff', 'is_active')

    fieldsets = (
        ('Personal Info', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('email', 'first_name', 'last_name', 'password')
        }),
        ('Permissions', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('is_staff', 'is_active')
        })
    )

    add_fieldsets = (
        ('Personal Info', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2')
        }),
        ('Permissions', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('is_active',)
        })
    )

    search_fields = ('email', 'first_name', 'last_name')

    ordering = ('id', 'email', 'first_name', 'last_name')


@admin.register(Voter)
class VoterAdmin(admin.ModelAdmin):
    list_display = (get_label('UUID', lambda obj: obj.uuid.hex),
                    get_label(
                        'Full Name', lambda obj: f'{obj.user.first_name} {obj.user.last_name}'),
                    get_label('Email', lambda obj: obj.user.email),
                    get_label('Color', get_color_panel('color')))

    filter_horizontal = ('voters_interested', 'voters_polled')

    fieldsets = (
        ('Voter Info', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('user', 'color')
        }),
    )

    add_fieldsets = (
        ('Voter Info', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('user', 'color')
        }),
    )

    search_fields = ('user',)

    ordering = ('id', 'user')


class StateInline(admin.TabularInline):
    model = State


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = (get_label('Country', get_location()),
                    'iso_3')

    inlines = (StateInline,)

    search_fields = ('name', 'code', 'iso_3')

    ordering = ('code',)


class CityInline(admin.TabularInline):
    model = City


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = (get_label('State', get_location()),
                    get_label('Country', get_location('country')))

    inlines = (CityInline,)

    list_filter = ('country',)

    search_fields = ('name', 'code')

    ordering = ('country', 'code')


class DistrictInline(admin.TabularInline):
    model = District


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = (get_label('City', get_location()),
                    get_label('State', get_location('state')),
                    get_label('Country', get_location('country')))

    inlines = (DistrictInline,)

    list_filter = ('country', 'state')

    search_fields = ('name', 'code')

    ordering = ('country', 'state', 'code')


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = (get_label('District', get_location()),
                    get_label('City', get_location('city')),
                    get_label('State', get_location('state')),
                    get_label('Country', get_location('country')))

    list_filter = ('country', 'state', 'city')

    search_fields = ('name', 'code')

    ordering = ('country', 'state', 'city', 'code')


@admin.register(PoliticalSpectrum)
class PoliticalSpectrumAdmin(admin.ModelAdmin):
    list_display = (get_label('UUID', lambda obj: obj.uuid.hex),
                    'spectrum')

    search_fields = ('spectrum',)

    ordering = ('id',)


@admin.register(PoliticalIdeology)
class PoliticalIdeologyAdmin(admin.ModelAdmin):
    list_display = (get_label('UUID', lambda obj: obj.uuid.hex),
                    'ideology')

    search_fields = ('ideology',)

    ordering = ('id',)


@admin.register(CandidateLike)
class CandidateLikeAdmin(admin.ModelAdmin):
    list_display = (
        get_label(
            'Voter', lambda obj: f'{obj.voter.user.first_name} {obj.voter.user.last_name}'),
        get_label(
            'Candidate', lambda obj: f'{obj.candidate.first_name} {obj.candidate.last_name}'))

    search_fields = ('voter', 'candidate')

    ordering = ('id', 'voter', 'candidate')


@admin.register(CandidateRating)
class CandidateRatingAdmin(admin.ModelAdmin):
    list_display = (
        get_label(
            'Voter', lambda obj: f'{obj.voter.user.first_name} {obj.voter.user.last_name}'),
        get_label(
            'Candidate', lambda obj: f'{obj.candidate.first_name} {obj.candidate.last_name}'),
        'value')

    search_fields = ('voter', 'candidate')

    ordering = ('id', 'voter', 'candidate')


@admin.register(PartyLike)
class PartyLikeAdmin(admin.ModelAdmin):
    list_display = (
        get_label(
            'Voter', lambda obj: f'{obj.voter.user.first_name} {obj.voter.user.last_name}'),
        get_label('Party', lambda obj: obj.party.name))

    search_fields = ('voter', 'party')

    ordering = ('id', 'voter', 'party')


@admin.register(PartyRating)
class PartyRatingAdmin(admin.ModelAdmin):
    list_display = (
        get_label(
            'Voter', lambda obj: f'{obj.voter.user.first_name} {obj.voter.user.last_name}'),
        get_label('Party', lambda obj: obj.party.name),
        'value')

    search_fields = ('voter', 'party')

    ordering = ('id', 'voter', 'party')


@admin.register(PartyIdeology)
class PartyIdeologyAdmin(admin.ModelAdmin):
    list_display = (
        get_label('Party', lambda obj: obj.party.name),
        'political_ideology')

    list_filter = ('political_ideology',)

    search_fields = ('party', 'political_ideology')

    ordering = ('id', 'party', 'political_ideology')


@admin.register(Party)
class PartyAdmin(admin.ModelAdmin):
    list_display = (get_label('UUID', lambda obj: obj.uuid.hex),
                    'name', 'leader',
                    get_label('Primary Color',
                              get_color_panel('primary_color')),
                    get_label('Secondary Color',
                              get_color_panel('secondary_color')),
                    get_label('Headquarters',
                              lambda obj: f'{obj.state}, {obj.country}'),
                    'foundation_date')

    list_filter = ('country', 'state', 'spectrum', 'ideologies')

    fieldsets = (
        ('Party Info', {
            'fields': ('name', 'leader', 'background', 'foundation_date')
        }),
        ('Headquarters', {
            'fields': ('country', 'state')
        }),
        ('Political Info', {
            'fields': ('spectrum', 'government_plan')
        }),
        ('Additional Info', {
            'fields': ('primary_color', 'secondary_color', 'logo', 'banner')
        })
    )

    add_fieldsets = (
        ('Party Info', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('name', 'leader', 'background', 'foundation_date')
        }),
        ('Headquarters', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('country', 'state')
        }),
        ('Political Info', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('spectrum', 'government_plan')
        }),
        ('Additional Info', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('primary_color', 'secondary_color', 'logo', 'banner')
        })
    )

    search_fields = ('name', 'leader', 'country', 'state')

    ordering = ('name', 'leader', 'foundation_date')


@admin.register(PoliticalInterest)
class PoliticalInterestAdmin(admin.ModelAdmin):
    list_display = (get_label('UUID', lambda obj: obj.uuid.hex),
                    'interest')

    search_fields = ('interest',)

    ordering = ('id',)


@admin.register(CandidateInterest)
class CandidateInterestAdmin(admin.ModelAdmin):
    list_display = (
        get_label(
            'Candidate', lambda obj: f'{obj.candidate.first_name} {obj.candidate.last_name}'),
        'political_interest', 'value')

    list_filter = ('political_interest',)

    search_fields = ('candidate', 'political_interest')

    ordering = ('id', 'candidate', 'political_interest')


@admin.register(VoterInterest)
class VoterInterestAdmin(admin.ModelAdmin):
    list_display = (
        get_label(
            'Voter', lambda obj: f'{obj.voter.user.first_name} {obj.voter.user.last_name}'),
        'political_interest', 'value')

    list_filter = ('political_interest',)

    search_fields = ('voter', 'political_interest')

    ordering = ('id', 'voter', 'political_interest')


@admin.register(ElectionType)
class ElectionTypeAdmin(admin.ModelAdmin):
    list_display = (get_label('UUID', lambda obj: obj.uuid.hex),
                    'type')

    search_fields = ('type',)

    ordering = ('id',)


@admin.register(Period)
class PeriodAdmin(admin.ModelAdmin):
    list_display = (get_label('UUID', lambda obj: obj.uuid.hex),
                    'year_start', 'year_end', 'is_current')

    search_fields = ('year_start', 'year_end')

    ordering = ('year_start',)


@admin.register(ElectionPeriod)
class ElectionPeriodAdmin(admin.ModelAdmin):
    list_display = (get_label('UUID', lambda obj: obj.uuid.hex),
                    'period', 'election_type')

    search_fields = ('election_type',)

    ordering = ('id',)


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = (get_label('UUID', lambda obj: obj.uuid.hex),
                    'candidate', 'election_period', 'ticket_type')

    list_filter = ('election_period', 'ticket_type')

    search_fields = ('candidate', 'election_period', 'ticket_type')

    ordering = ('candidate', 'election_period', 'ticket_type')


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = (get_label('UUID', lambda obj: obj.uuid.hex),
                    get_label(
                        'Full Name', lambda obj: f'{obj.first_name} {obj.last_name}'),
                    'career', 'last_job', 'party', 'birthday',
                    get_label('Birthplace', lambda obj:
                              f'{", ".join([str(loc) for loc in [obj.district, obj.city, obj.state] if loc])} ({obj.country})'))

    list_filter = ('country', 'state', 'party')

    fieldsets = (
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'background', 'birthday')
        }),
        ('Birthplace', {
            'fields': ('country', 'state', 'city', 'district')
        }),
        ('Professional Info', {
            'fields': ('career', 'last_job')
        }),
        ('Additional Info', {
            'fields': ('party', 'image')
        })
    )

    add_fieldsets = (
        ('Personal Info', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('first_name', 'last_name', 'background', 'birthday')
        }),
        ('Birthplace', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('country', 'state', 'city', 'district')
        }),
        ('Professional Info', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('career', 'last_job')
        }),
        ('Additional Info', {
            'classes': ('wide', 'extrapretty'),
            'fields': ('party', 'image')
        })
    )

    search_fields = ('last_name', 'career', 'last_job', 'party')

    ordering = ('last_name', 'party', 'career')


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    def get_form(self, request, obj=None, **kwargs):
        form = super(PollAdmin, self).get_form(request, obj, **kwargs)
        form.base_fields['campaign'].queryset = Campaign.objects.filter(
            ticket_type__exact='MN')
        return form

    list_display = (get_label('Voter', lambda obj: f'{obj.voter.user.first_name} {obj.voter.user.last_name}'),
                    'campaign', 'timecode', 'created_at')

    list_filter = ('created_at',)

    search_fields = ('voter', 'campaign')

    ordering = ('id', 'campaign', 'voter')
