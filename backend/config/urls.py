"""kanban URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url
from rest_framework import routers

from apps.profile.views import IconViewSet, UserViewSet
from apps.main.views import AppView
from apps.kanban.views import (
    BoardViewSet,
    TagViewSet,
    LaneViewSet,
    CardViewSet,
    CommentViewSet,
    SortLaneAPIView,
    SortCardAPIView,
)

profile_router = routers.DefaultRouter()
profile_router.register(r"icons", IconViewSet)
profile_router.register(r"users", UserViewSet)

kanban_router = routers.DefaultRouter()
kanban_router.register(r"boards", BoardViewSet)
kanban_router.register(r"tags", TagViewSet)
kanban_router.register(r"lanes", LaneViewSet)
kanban_router.register(r"cards", CardViewSet)
kanban_router.register(r"comments", CommentViewSet)

urlpatterns = [
    # Auth urls
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/register/", include("dj_rest_auth.registration.urls")),
    # Account urls
    path("api/profile/", include(profile_router.urls)),
    # Kanban urls
    path("api/kanban/", include(kanban_router.urls)),
    path("api/kanban/sort/lane/", SortLaneAPIView.as_view(), name="sort-lane"),
    path("api/kanban/sort/card/", SortCardAPIView.as_view(), name="sort-card"),
    # Secret backdoor url
    path("arcane/", admin.site.urls),
    # Load app
    url(r"^", AppView.as_view(), name="app"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
