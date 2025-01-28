from django.urls import path
from django.shortcuts import redirect

from rest_framework.routers import SimpleRouter

from .views import *

app_name = 'voteraid'

views = [
    {'prefix': r'auth/?', 'viewset': AuthViewSet, 'basename': 'auth'},
    {'prefix': r'political-interest/?', 'viewset': PoliticalInterestViewSet, 'basename': 'political_interest'},
    {'prefix': r'election-type/?', 'viewset': ElectionTypeViewSet, 'basename': 'election_type'},
    {'prefix': r'party/?', 'viewset': PartyViewSet, 'basename': 'party'},
    {'prefix': r'poll/?', 'viewset': PollViewSet, 'basename': 'poll'},
    {'prefix': r'period/?', 'viewset': PeriodViewSet, 'basename': 'period'},
    {'prefix': r'candidate/?', 'viewset': CandidateViewSet, 'basename': 'candidate'}
]

router = SimpleRouter(trailing_slash=True)

for v in views:
    router.register(**v)

urlpatterns = [
    path('', lambda _: redirect('admin:index'), name='index')
] + router.urls
