from django.db.models import Avg, Count
from django.utils import timezone

from rest_framework import serializers

from .models import *


class ReadLikeRatingSerializer(serializers.ModelSerializer):
    liked = serializers.SerializerMethodField(label='Liked',
                                              method_name='get_liked')
    totalLikes = serializers.SerializerMethodField(label='Total Likes',
                                                   method_name='count_total_likes')
    rating = serializers.SerializerMethodField(label='Rating',
                                               method_name='get_rating')
    averageRating = serializers.SerializerMethodField(label='Average Rating',
                                                      method_name='aggregate_average_rating')

    def get_current_voter(self):
        current_user = None
        if (request := self.context.get('request')) and request and hasattr(request, 'user'):
            current_user = request.user
        if not (current_user
                and current_user.is_authenticated
                and hasattr(current_user, 'voter')):
            return None
        return current_user.voter

    def get_liked(self, _):
        pass

    def get_rating(self, _):
        pass

    def count_total_likes(self, _):
        pass

    def aggregate_average_rating(self, _):
        pass

    class Meta:
        abstract = True


class WriteLikeRatingSerializer(serializers.ModelSerializer):
    liked = serializers.BooleanField(label='Liked', write_only=True)
    rating = serializers.FloatField(label='Rating', write_only=True)

    def get_like_class(self):
        pass

    def get_rating_class(self):
        pass

    def __update_like(self, params, _):
        like_class = self.get_like_class()
        filtered = like_class.objects.filter(**params)
        contains_voter = params['voter'] and filtered.exists()
        if not contains_voter:
            like_class.objects.create(**params)
        else:
            filtered.delete()

    def __update_rating(self, params, validated_data):
        extended_params = {
            **params,
            'value': validated_data['rating']
        }
        rating_class = self.get_rating_class()
        filtered = rating_class.objects.filter(**params)
        contains_voter = params['voter'] and filtered.exists()
        if contains_voter:
            filtered.delete()
        rating_class.objects.create(**extended_params)

    def get_update_options(self):
        return {
            'liked': self.__update_like,
            'rating': self.__update_rating
        }

    def update_like_rating(self, class_name,
                           instance, validated_data):
        for option, update_func in self.get_update_options().items():
            data = validated_data.get(option, None)
            if data is not None:
                params = {
                    class_name: instance,
                    'voter': validated_data['voter']
                }
                update_func(params, validated_data)
        return instance

    class Meta:
        abstract = True


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(label='E-mail')

    firstName = serializers.CharField(source='first_name', label='First Name')
    lastName = serializers.CharField(source='last_name', label='Last Name')

    password = serializers.CharField(label='Password',
                                     write_only=True,
                                     style={'input_type': 'password'})
    passwordConfirmation = serializers.CharField(label='Password confirmation',
                                                 write_only=True,
                                                 style={'input_type': 'password'})

    class Meta:
        model = User
        fields = serializers.ALL_FIELDS


class ReadUserSerializer(UserSerializer):
    class Meta:
        model = UserSerializer.Meta.model
        fields = ('email', 'firstName', 'lastName')


class WriteUserSerializer(UserSerializer):
    def validate(self, data):
        email = data.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('Email is already registered')
        password = data.get('password')
        passwordConfirmation = data.get('passwordConfirmation')
        if not password or not passwordConfirmation:
            raise serializers.ValidationError(
                'Missing password and its confirmation')
        if password != passwordConfirmation:
            raise serializers.ValidationError('Passwords don\'t match')
        return data

    def create(self, validated_data):
        validated_data.pop('passwordConfirmation')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

    class Meta:
        model = UserSerializer.Meta.model
        fields = ('email', 'firstName', 'lastName',
                  'password', 'passwordConfirmation')


class LoginUserSerializer(UserSerializer):
    class Meta:
        model = UserSerializer.Meta.model
        fields = ('email', 'password')


class ElectionTypeSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(label='Uuid', format='hex')
    type = serializers.CharField(label='Election Type')
    typeName = serializers.CharField(source='get_type_display',
                                     label='Election Type Name')
    image = serializers.ImageField(label='Image')

    class Meta:
        model = ElectionType
        fields = ('uuid', 'type', 'typeName', 'image')


class PoliticalInterestSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(label='Uuid', format='hex')
    interest = serializers.CharField(source='get_interest_display',
                                     label='Political Interest')

    class Meta:
        model = PoliticalInterest
        fields = ('uuid', 'interest')


class VoterInterestSerializer(serializers.ModelSerializer):
    value = serializers.IntegerField(
        label='Value', default=0, max_value=10, min_value=0)

    class Meta:
        model = VoterInterest
        fields = serializers.ALL_FIELDS


class ReadVoterInterestSerializer(VoterInterestSerializer):
    politicalInterest = PoliticalInterestSerializer(
        source='political_interest',
        label='Political Interest')

    class Meta:
        model = VoterInterestSerializer.Meta.model
        fields = ('politicalInterest', 'value')


class WriteVoterInterestSerializer(VoterInterestSerializer):
    politicalInterestUuid = serializers.UUIDField(label='Political Interest',
                                                  format='hex',
                                                  write_only=True)

    def create(self, validated_data):
        voter = validated_data.pop('voter')
        political_interest_uuid = validated_data.pop('politicalInterestUuid')
        political_interest = PoliticalInterest.objects.get(
            uuid=political_interest_uuid)
        return VoterInterest.objects.create(voter=voter,
                                            political_interest=political_interest,
                                            **validated_data)

    class Meta:
        model = VoterInterestSerializer.Meta.model
        fields = ('politicalInterestUuid', 'value')


class VoterSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(label='Uuid', format='hex')
    color = serializers.CharField(label='Color')

    class Meta:
        model = Voter
        fields = serializers.ALL_FIELDS


class ReadVoterSerializer(VoterSerializer):
    user = ReadUserSerializer(label='User')
    voterInterests = ReadVoterInterestSerializer(
        source='voter_interests', many=True)

    class Meta:
        model = VoterSerializer.Meta.model
        fields = ('uuid', 'user', 'color', 'voterInterests')


class WriteVoterSerializer(VoterSerializer):
    def create(self, validated_data):
        user = validated_data.pop('user')
        return Voter.objects.create(user=user,
                                    **validated_data)

    class Meta:
        model = VoterSerializer.Meta.model
        fields = ('color',)


class PartySerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(label='Uuid', format='hex')
    name = serializers.CharField(label='Name')
    primaryColor = serializers.CharField(
        source='primary_color', label='Primary Color')
    secondaryColor = serializers.CharField(
        source='secondary_color', label='Secondary Color')

    logo = serializers.ImageField(label='Logo')
    background = serializers.CharField(label='Background')
    leader = serializers.CharField(label='Leader')
    governmentPlan = serializers.URLField(
        source='government_plan', label='Government Plan')

    headquarters = serializers.SerializerMethodField(label='Headquarters',
                                                     method_name='get_headquarters')
    spectrum = serializers.CharField(
        source='spectrum.get_spectrum_display', label='Spectrum')

    ideologies = serializers.SlugRelatedField(
        label='Ideologies', slug_field='ideology',
        many=True, queryset=PoliticalIdeology.objects.all())

    foundationDate = serializers.DateField(
        source='foundation_date', label='Foundation Date', format='%B %Y')

    banner = serializers.ImageField(label='Banner')

    def get_headquarters(self, obj):
        return f'{obj.state}, {obj.country}'

    class Meta:
        model = Party
        fields = serializers.ALL_FIELDS


class ReadPartySerializer(PartySerializer, ReadLikeRatingSerializer):
    def get_liked(self, obj):
        current_voter = self.get_current_voter()
        if not current_voter:
            return False
        filtered = PartyLike.objects.filter(
            party=obj, voter=current_voter)
        return (current_voter and filtered.exists()) or False

    def count_total_likes(self, obj):
        return PartyLike.objects.filter(party=obj).aggregate(
            total_likes=Count('voter'))['total_likes'] or 0

    def get_rating(self, obj):
        current_voter = self.get_current_voter()
        if not current_voter:
            return 0.0
        filtered = PartyRating.objects.filter(
            party=obj, voter=current_voter)
        return (current_voter and filtered.exists() and filtered[0].value) or 0.0

    def aggregate_average_rating(self, obj):
        return PartyRating.objects.filter(party=obj).aggregate(
            average_rating=Avg('value'))['average_rating'] or 0.0

    class Meta:
        model = PartySerializer.Meta.model
        fields = ('uuid', 'name', 'primaryColor', 'secondaryColor',
                  'logo', 'background', 'leader', 'governmentPlan',
                  'headquarters', 'spectrum', 'ideologies',
                  'liked', 'rating',
                  'totalLikes', 'averageRating',
                  'foundationDate', 'banner')


class WritePartySerializer(PartySerializer, WriteLikeRatingSerializer):
    def get_like_class(self):
        return PartyLike

    def get_rating_class(self):
        return PartyRating

    def update(self, instance, validated_data):
        return self.update_like_rating('party', instance, validated_data)

    class Meta:
        model = PartySerializer.Meta.model
        fields = ('liked', 'rating')


class CandidatePartySerializer(PartySerializer):
    class Meta:
        model = PartySerializer.Meta.model
        fields = ('uuid', 'name', 'primaryColor', 'secondaryColor',
                  'logo', 'headquarters')


class CandidateInterestSerializer(serializers.ModelSerializer):
    value = serializers.IntegerField(
        label='Value', default=0, max_value=10, min_value=0)

    class Meta:
        model = CandidateInterest
        fields = serializers.ALL_FIELDS


class ReadCandidateInterestSerializer(CandidateInterestSerializer):
    politicalInterest = PoliticalInterestSerializer(
        source='political_interest',
        label='Political Interest')

    class Meta:
        model = CandidateInterestSerializer.Meta.model
        fields = ('politicalInterest', 'value')


class WriteCandidateInterestSerializer(CandidateInterestSerializer):
    politicalInterestUuid = serializers.UUIDField(label='Political Interest',
                                                  format='hex',
                                                  write_only=True)

    def create(self, validated_data):
        candidate = validated_data.pop('candidate')
        political_interest_uuid = validated_data.pop('politicalInterestUuid')
        political_interest = PoliticalInterest.objects.get(
            uuid=political_interest_uuid)
        return CandidateInterest.objects.create(candidate=candidate,
                                                political_interest=political_interest,
                                                **validated_data)

    class Meta:
        model = CandidateInterestSerializer.Meta.model
        fields = ('politicalInterestUuid', 'value')


class CandidateSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(label='Uuid', format='hex')
    firstName = serializers.CharField(source='first_name', label='First Name')
    lastName = serializers.CharField(source='last_name', label='Last Name')

    image = serializers.ImageField(label='Image')
    background = serializers.CharField(label='Background')

    birthplace = serializers.SerializerMethodField(label='Birthplace',
                                                   method_name='get_birthplace')
    birthday = serializers.DateField(label='Birthday', format='%B %d, %Y')

    career = serializers.CharField(label='Career', max_length=100)
    lastJob = serializers.CharField(
        label='Last Job', source='last_job', max_length=100)

    party = CandidatePartySerializer(label='Party')

    candidateInterests = ReadCandidateInterestSerializer(
        source='candidate_interests', many=True)

    def get_birthplace(self, obj):
        return f'{obj.city}, {obj.state} - {obj.country}'

    class Meta:
        model = Candidate
        fields = serializers.ALL_FIELDS


class ReadCandidateSerializer(CandidateSerializer, ReadLikeRatingSerializer):
    def get_liked(self, obj):
        current_voter = self.get_current_voter()
        if not current_voter:
            return False
        filtered = CandidateLike.objects.filter(
            candidate=obj, voter=current_voter)
        return (current_voter and filtered.exists()) or False

    def count_total_likes(self, obj):
        return CandidateLike.objects.filter(candidate=obj).aggregate(
            total_likes=Count('voter'))['total_likes'] or 0

    def get_rating(self, obj):
        current_voter = self.get_current_voter()
        if not current_voter:
            return 0.0
        filtered = CandidateRating.objects.filter(
            candidate=obj, voter=current_voter)
        return (current_voter and filtered.exists() and filtered[0].value) or 0.0

    def aggregate_average_rating(self, obj):
        return CandidateRating.objects.filter(candidate=obj).aggregate(
            average_rating=Avg('value'))['average_rating'] or 0.0

    class Meta:
        model = CandidateSerializer.Meta.model
        fields = ('uuid', 'firstName', 'lastName', 'image',
                  'background', 'birthplace', 'birthday',
                  'career', 'lastJob', 'party',
                  'liked', 'rating',
                  'totalLikes', 'averageRating',
                  'candidateInterests')


class CampaignCandidateSerializer(ReadCandidateSerializer):
    class Meta:
        model = ReadCandidateSerializer.Meta.model
        fields = ('uuid', 'firstName', 'lastName', 'image',
                  'birthplace', 'birthday',
                  'career', 'lastJob', 'party',
                  'liked',
                  'totalLikes',
                  'candidateInterests')


class WriteCandidateSerializer(CandidateSerializer, WriteLikeRatingSerializer):
    def get_like_class(self):
        return CandidateLike

    def get_rating_class(self):
        return CandidateRating

    def update(self, instance, validated_data):
        return self.update_like_rating('candidate', instance, validated_data)

    class Meta:
        model = CandidateSerializer.Meta.model
        fields = ('liked', 'rating')


class PeriodSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(label='Uuid', format='hex')
    yearStart = serializers.IntegerField(
        source='year_start', label='Year Start')
    yearEnd = serializers.IntegerField(source='year_end', label='Year End')
    isCurrent = serializers.BooleanField(
        source='is_current', label='Is Current')

    class Meta:
        model = Period
        fields = ('uuid', 'yearStart', 'yearEnd', 'isCurrent')


class CampaignSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(label='Uuid', format='hex')

    candidate = CampaignCandidateSerializer(label='Candidate')

    campaignPlace = serializers.SerializerMethodField(label='Campaign place',
                                                      method_name='get_campaign_place')
    ticketType = serializers.SerializerMethodField(label='Election Ticket Type',
                                                   method_name='get_ticket_type')

    def get_campaign_place(self, obj):
        country = f'{obj.country}'
        locations = [obj.district, obj.city, obj.state]
        filtered_locations = ', '.join([str(l) for l in locations if l])
        w_locations = f'{filtered_locations} - {country}' if filtered_locations else country
        return w_locations

    def get_ticket_type(self, obj):
        election_type = obj.election_period.election_type.get_type_display()
        ticket_type = '' if obj.ticket_type == 'MN' else obj.get_ticket_type_display()
        return ticket_type.replace(' ', f' {election_type} ') if ticket_type else election_type

    class Meta:
        model = Campaign
        fields = ('uuid', 'candidate', 'campaignPlace',
                  'ticketType')


class PollCampaignSerializer(CampaignSerializer):
    totalVoters = serializers.SerializerMethodField(label='Total Voters',
                                                    method_name='count_total_voters')

    def count_total_voters(self, obj):
        return obj.polls.aggregate(total_voters=Count('voter'))['total_voters'] or 0

    class Meta:
        model = CampaignSerializer.Meta.model
        fields = ('uuid', 'candidate', 'totalVoters')


class PollSerializer(serializers.ModelSerializer):
    timecode = serializers.CharField(label='Timecode', max_length=14)

    class Meta:
        model = Poll
        fields = serializers.ALL_FIELDS


class WritePollSerializer(PollSerializer):
    campaignUuid = serializers.UUIDField(label='Campaign Uuid',
                                         format='hex',
                                         write_only=True)

    def validate(self, data):
        campaign_uuid = data.get('campaignUuid')
        campaign = Campaign.objects.get(uuid=campaign_uuid)
        voter = data.get('voter')
        timecode = timezone.now().strftime('%Y%U')
        if Poll.objects.filter(campaign=campaign, voter=voter, timecode=timecode).exists():
            raise serializers.ValidationError('Poll has already been voted')
        return data

    def create(self, validated_data):
        campaign_uuid = validated_data.pop('campaignUuid')
        campaign = Campaign.objects.get(uuid=campaign_uuid)
        return Poll.objects.create(campaign=campaign,
                                   **validated_data)

    class Meta:
        model = PollSerializer.Meta.model
        fields = ('campaignUuid',)
