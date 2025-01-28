"""
finalproject URL Configuration
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic.base import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='admin/', permanent=True)),
    re_path(r'admin/?', admin.site.urls),
    re_path(r'chaining/?', include('smart_selects.urls')),
    re_path(r'api/?', include('voteraid.urls')),
]

if settings.DEBUG:
    urlpatterns += [
        *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
        *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    ]
