from django.contrib.auth import get_user_model
from rest_framework import mixins
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet, ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated

from apps.utils import action
from apps.profile.models import Icon
from apps.profile.serializers import (
    IconSerializer,
    UserSerializer,
    UserDetailSerializer,
)

User = get_user_model()


class IconViewSet(ReadOnlyModelViewSet):
    serializer_class = IconSerializer
    queryset = Icon.objects.all()
    permission_classes = [IsAuthenticated]


class UserViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet,
):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "retrieve" or self.action == "update":
            return UserDetailSerializer
        return super().get_serializer_class()

    @action(detail=True, methods=["post"])
    # TODO: update action decorator to support "-" instead of "_"
    # TODO: implemented, test this action
    def update_icon(self, request, pk):
        icon_id = request.data.get("id")
        icon = Icon.objects.get(id=icon_id)
        user = self.get_object()
        user.icon = icon
        user.save()
        return Response(IconSerializer(instance=icon).data)
