from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated

from .mixins import *
from .models import *
from .serializers import *


class AuthViewSet(ResponseMixin,
                  MultipleSerializerMixin,
                  viewsets.GenericViewSet):
    serializer_class = UserSerializer
    multiple_serializer_classes = {
        'login': LoginUserSerializer,
        'logout': ReadUserSerializer,
        'register': WriteUserSerializer
    }
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path=r'login/?')
    def login(self, request):
        request_user = request.data.get('user', {})

        try:
            u_serializer = self.get_serializer(data=request_user)

            if u_serializer.is_valid(raise_exception=True):
                user_data = u_serializer.validated_data
                email = user_data.get('email', '')
                password = user_data.get('password', '')

                user = authenticate(username=email, password=password)

                if user is not None:
                    login(request, user)
                    token, _ = Token.objects.get_or_create(user=user)
                    csrftoken = get_token(request)

                    v_serializer = ReadVoterSerializer(instance=user.voter)
                    voter_data = v_serializer.data

                    data = {
                        'voter': voter_data,
                        'authtoken': token.key,
                        'csrftoken': csrftoken
                    }

                    return self.send_successful_response(message='Login was successful',
                                                         data=data)
                else:
                    raise User.DoesNotExist
            else:
                raise Exception('Invalid data entered')
        except:
            return self.send_failed_response(message='Invalid email or password')

    @action(detail=False, methods=['get'], url_path=r'logout/?')
    def logout(self, request):
        try:
            request.user.auth_token.delete()
            logout(request)
            return self.send_successful_response(message='Logout was successful',
                                                 data=None,
                                                 status_code=status.HTTP_204_NO_CONTENT)
        except:
            return self.send_failed_response(message='Logout has failed')

    @action(detail=False, methods=['post'], url_path=r'register/?')
    def register(self, request):
        request_user = request.data.get('user', {})
        request_voter = request.data.get('voter', {})
        request_voter_interest = request.data.get('voterInterests', [])

        try:
            u_serializer = self.get_serializer(data=request_user)
            v_serializer = WriteVoterSerializer(data=request_voter)
            v_i_serializer = WriteVoterInterestSerializer(
                data=request_voter_interest, many=True)

            if u_serializer.is_valid(raise_exception=True) \
                    and v_serializer.is_valid(raise_exception=True) \
                    and v_i_serializer.is_valid(raise_exception=True):

                user = u_serializer.save()
                voter = v_serializer.save(user=user)
                v_i_serializer.save(voter=voter)

                login(request, user)
                token, _ = Token.objects.get_or_create(user=user)
                csrftoken = get_token(request)

                v_serializer = ReadVoterSerializer(instance=voter)
                voter_data = v_serializer.data

                data = {
                    'voter': voter_data,
                    'authtoken': token.key,
                    'csrftoken': csrftoken
                }

                return self.send_successful_response(message='Registration was successful',
                                                     data=data)
            else:
                raise Exception('Invalid data entered')
        except:
            return self.send_failed_response(message='Registration has failed')

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(AuthViewSet, self).dispatch(*args, **kwargs)


class PartyViewSet(ResponseMixin,
                   MultipleSerializerMixin,
                   MultiplePermissionMixin,
                   MultipleFilterMixin,
                   viewsets.GenericViewSet):
    serializer_class = PartySerializer
    multiple_serializer_classes = {
        'limited': CandidatePartySerializer,
        'list': ReadPartySerializer,
        'retrieve': ReadPartySerializer,
        'partial_update': WritePartySerializer
    }

    multiple_permission_classes = {
        'limited': [AllowAny],
        'list': [AllowAny],
        'retrieve': [AllowAny],
        'partial_update': [IsAuthenticated]
    }
    multiple_filters = {
        'name': ['name__icontains']
    }

    def get_queryset(self):
        return Party.objects.filter(candidates__in=[camp.candidate for camp in
                                                    Campaign.objects.filter(election_period__period__is_current=True)]).distinct()

    @action(detail=False, methods=['get'], url_path=r'limited/?')
    def limited(self, _):
        try:
            queryset = self.get_queryset()
            p_serializer = self.get_serializer(instance=queryset, many=True)
            party_data = p_serializer.data
            return self.send_successful_response(data=party_data)
        except:
            return self.send_failed_response()

    def list(self, request):
        try:
            queryset = self.get_queryset().filter(self.get_filter_query())

            query_params = request.query_params
            page_number = query_params.get('page', 1)

            paginator = Paginator(queryset, 8)
            num_pages = paginator.num_pages

            object_list = paginator.get_page(page_number).object_list
            p_serializer = self.get_serializer(instance=object_list, many=True)
            party_data = p_serializer.data

            data = {
                'totalPages': num_pages,
                'page': party_data
            }

            return self.send_successful_response(data=data)
        except:
            return self.send_failed_response()

    def get_party_object(self, uuid=None):
        queryset = self.get_queryset()
        party = get_object_or_404(queryset, uuid=uuid)
        return party

    def retrieve(self, _, pk=None):
        try:
            party = self.get_party_object(uuid=pk)
            p_serializer = self.get_serializer(instance=party)
            party_data = p_serializer.data
            return self.send_successful_response(data=party_data)
        except:
            return self.send_failed_response()

    def partial_update(self, request, pk=None):
        request_party = request.data.get('party', {})

        try:
            party = self.get_party_object(uuid=pk)
            p_serializer = self.get_serializer(
                instance=party, data=request_party, partial=True)
            if p_serializer.is_valid(raise_exception=True):
                saved_party = p_serializer.save(voter=request.user.voter)
                p_read_serializer = ReadPartySerializer(
                    instance=saved_party, context={'request': request})
                party_data = p_read_serializer.data
                data = {
                    'liked': party_data['liked'],
                    'totalLikes': party_data['totalLikes'],
                    'rating': party_data['rating'],
                    'averageRating': party_data['averageRating']
                }
                return self.send_successful_response(message='Party update was successful',
                                                     data=data)
        except:
            return self.send_failed_response(message='Party update has failed')


class CandidateViewSet(ResponseMixin,
                       MultipleSerializerMixin,
                       MultiplePermissionMixin,
                       MultipleFilterMixin,
                       viewsets.GenericViewSet):
    serializer_class = CandidateSerializer
    multiple_serializer_classes = {
        'limited': CampaignSerializer,
        'list': CampaignSerializer,
        'retrieve': ReadCandidateSerializer,
        'partial_update': WriteCandidateSerializer
    }
    multiple_permission_classes = {
        'limited': [AllowAny],
        'list': [AllowAny],
        'retrieve': [AllowAny],
        'partial_update': [IsAuthenticated]
    }
    multiple_filters = {
        'name': ['candidate__first_name__icontains',
                 'candidate__last_name__icontains'],
        'electionType': ['election_period__election_type__type__exact'],
        'party': ['candidate__party__uuid__exact']
    }

    def get_queryset(self):
        return Campaign.objects.filter(election_period__period__is_current=True).order_by(
            'candidate__party', 'ticket_type').distinct()

    @action(detail=False, methods=['get'], url_path=r'limited/?')
    def limited(self, _):
        try:
            queryset = self.get_queryset().filter(
                election_period__election_type__type__exact='PR', ticket_type__exact='MN')
            c_serializer = self.get_serializer(instance=queryset, many=True)
            candidate_data = c_serializer.data
            return self.send_successful_response(data=candidate_data)
        except:
            return self.send_failed_response()

    def list(self, request):
        try:
            queryset = self.get_queryset().filter(self.get_filter_query())

            query_params = request.query_params
            page_number = query_params.get('page', 1)

            paginator = Paginator(queryset, 8)
            num_pages = paginator.num_pages

            object_list = paginator.get_page(page_number).object_list
            c_serializer = self.get_serializer(instance=object_list, many=True)
            candidate_data = c_serializer.data

            data = {
                'totalPages': num_pages,
                'page': candidate_data
            }

            return self.send_successful_response(data=data)
        except:
            return self.send_failed_response()

    def get_candidate_object(self, uuid=None):
        queryset = Candidate.objects.all()
        candidate = get_object_or_404(queryset, uuid=uuid)
        return candidate

    def retrieve(self, _, pk=None):
        try:
            candidate = self.get_candidate_object(uuid=pk)
            c_serializer = self.get_serializer(instance=candidate)
            candidate_data = c_serializer.data
            return self.send_successful_response(data=candidate_data)
        except:
            return self.send_failed_response()

    def partial_update(self, request, pk=None):
        request_candidate = request.data.get('candidate', {})

        try:
            candidate = self.get_candidate_object(uuid=pk)
            c_serializer = self.get_serializer(
                instance=candidate, data=request_candidate, partial=True)
            if c_serializer.is_valid(raise_exception=True):
                saved_candidate = c_serializer.save(voter=request.user.voter)
                c_read_serializer = ReadCandidateSerializer(
                    instance=saved_candidate, context={'request': request})
                candidate_data = c_read_serializer.data
                data = {
                    'liked': candidate_data['liked'],
                    'totalLikes': candidate_data['totalLikes'],
                    'rating': candidate_data['rating'],
                    'averageRating': candidate_data['averageRating']
                }
                return self.send_successful_response(message='Candidate update was successful',
                                                     data=data)
        except:
            return self.send_failed_response(message='Candidate update has failed')


class PeriodViewSet(ResponseMixin,
                    viewsets.GenericViewSet):
    serializer_class = PeriodSerializer
    permission_classes = [AllowAny]

    queryset = Period.objects.all()

    def get_period_object(self):
        queryset = self.get_queryset()
        period = get_object_or_404(queryset, is_current=True)
        return period

    @action(detail=False, methods=['get'], url_path=r'current/?')
    def current(self, _):
        try:
            period = self.get_period_object()
            p_serializer = self.get_serializer(instance=period)
            period_data = p_serializer.data

            data = f'{period_data["yearStart"]} - {period_data["yearEnd"]}'

            return self.send_successful_response(data=data)
        except:
            return self.send_failed_response()


class PoliticalInterestViewSet(ResponseMixin,
                               viewsets.GenericViewSet):
    serializer_class = PoliticalInterestSerializer
    permission_classes = [AllowAny]

    queryset = PoliticalInterest.objects.all()

    def list(self, _):
        try:
            queryset = self.get_queryset()
            p_i_serializer = self.get_serializer(
                instance=queryset, many=True)
            political_interest_data = p_i_serializer.data
            return self.send_successful_response(data=political_interest_data)
        except:
            return self.send_failed_response()


class ElectionTypeViewSet(ResponseMixin,
                          viewsets.GenericViewSet):
    serializer_class = ElectionTypeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        filtered_election_periods = ElectionPeriod.objects.filter(
            period__is_current=True)
        return [ep.election_type for ep in filtered_election_periods]

    def list(self, _):
        try:
            queryset = self.get_queryset()
            e_t_serializer = self.get_serializer(
                instance=queryset, many=True)
            election_type_data = e_t_serializer.data
            return self.send_successful_response(data=election_type_data)
        except:
            return self.send_failed_response()


class PollViewSet(ResponseMixin,
                  MultipleSerializerMixin,
                  MultiplePermissionMixin,
                  viewsets.GenericViewSet):
    serializer_class = PollSerializer
    multiple_serializer_classes = {
        'create': WritePollSerializer,
        'list': CampaignSerializer
    }
    multiple_permission_classes = {
        'create': [IsAuthenticated],
        'list': [AllowAny],
        'current': [IsAuthenticated]
    }

    def get_queryset(self):
        from django.db.models import F, Count
        from datetime import datetime, timedelta

        campaigns_params = {
            'timecode': F('polls__timecode'),
            'firstName': F('candidate__first_name'),
            'lastName': F('candidate__last_name'),
            'primaryColor': F('candidate__party__primary_color'),
        }

        poll_params = {
            'result': Count('polls')
        }

        all_campaigns = Campaign.objects.filter(
            election_period__election_type__type='PR', ticket_type__exact='MN'
        ).values(**campaigns_params).annotate(**poll_params)

        timecodes_set = set()
        for q in all_campaigns:
            timecodes_set.add(q['timecode'])
        results = [{'timecode': t,
                    'week': int(date.strftime('%U')),
                    'startDate': date.strftime('%b %d, %Y'),
                    'endDate': (date + timedelta(days=6)).strftime('%b %d, %Y'),
                    'campaigns': []} for t in sorted(timecodes_set, reverse=True)
                   if (date := datetime.strptime(t + '-0', '%Y%U-%w'))]
        for q in all_campaigns:
            campaigns = next(r['campaigns']
                             for r in results if r['timecode'] == q['timecode'])
            campaigns.append(
                {k: v for k, v in q.items() if k != 'timecode'})

        return results

    def create(self, request):
        request_poll = request.data.get('poll', {})

        try:
            p_serializer = self.get_serializer(data=request_poll)
            if p_serializer.is_valid(raise_exception=True):
                p_serializer.save(voter=request.user.voter)
                return self.send_successful_response(message='Poll vote was successful',
                                                     data=None,
                                                     status_code=status.HTTP_201_CREATED)
        except:
            return self.send_failed_response(message='Poll vote has failed')

    def get_poll_object(self, request):
        from datetime import date
        currentTimecode = date.today().strftime('%Y%U')

        poll_params = {
            'timecode': currentTimecode,
            'voter': request.user.voter
        }
        exists_poll = Poll.objects.filter(**poll_params).exists()
        if not exists_poll:
            raise Poll.DoesNotExist

        queryset = self.get_queryset()
        poll = next(
            (r for r in queryset if r['timecode'] == currentTimecode), None)
        if poll:
            return poll
        raise Poll.DoesNotExist

    def list(self, request):
        try:
            queryset = self.get_queryset()

            query_params = request.query_params
            page_number = query_params.get('page', 1)

            paginator = Paginator(queryset, 8)
            num_pages = paginator.num_pages

            object_list = paginator.get_page(page_number).object_list

            data = {
                'totalPages': num_pages,
                'page': object_list
            }

            return self.send_successful_response(data=data)
        except:
            return self.send_failed_response()

    @action(detail=False, methods=['get'], url_path=r'current/?')
    def current(self, request):
        try:
            poll_data = self.get_poll_object(request)
            return self.send_successful_response(data=poll_data)
        except:
            return self.send_failed_response()
