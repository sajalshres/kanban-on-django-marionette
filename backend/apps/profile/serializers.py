from pathlib import Path

from django.contrib.auth import get_user_model
from django.middleware import csrf
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from dj_rest_auth.models import TokenModel

from apps.profile.models import Icon

User = get_user_model()


class IconSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Icon
        fields = ["id", "photo", "name"]

    def get_name(self, obj):
        return Path(obj.photo.name).stem


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class UserDetailSerializer(serializers.ModelSerializer):
    icon = IconSerializer(read_only=True)
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())], required=False
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "icon",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "icon",
            "date_joined",
        ]


class TokenSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    photo_url = serializers.SerializerMethodField()
    csrftoken = serializers.SerializerMethodField()
    logged_in = serializers.SerializerMethodField()

    class Meta:
        model = TokenModel
        fields = ("id", "username", "photo_url", "csrftoken", "logged_in")

    def get_photo_url(self, obj):
        if not obj.user.icon:
            return None
        return obj.user.icon.photo.url

    def get_csrftoken(self, obj):
        return csrf.get_token(self.context.get("request"))

    def get_logged_in(self, obj):
        return self.context.get("request").user.is_authenticated
