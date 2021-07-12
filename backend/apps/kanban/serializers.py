from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.validators import ValidationError

from apps.kanban.models import Board, Tag, Lane, Card, Comment
from apps.profile.serializers import IconSerializer

User = get_user_model()


class BoardMemberSerializer(serializers.ModelSerializer):
    icon = IconSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "icon"]


class BoardSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Board
        fields = ["id", "name", "owner"]


class TagSerializer(serializers.ModelSerializer):
    board = serializers.PrimaryKeyRelatedField(queryset=Board.objects.all())

    class Meta:
        model = Tag
        fields = ["id", "name", "board"]

    def update(self, instance, validated_data):
        try:
            return super().update(instance, validated_data)
        except IntegrityError:
            raise ValidationError("Tag already exists")

    def create(self, validated_data):
        if self.context["request"].user not in validated_data["board"].members.all():
            raise serializers.ValidationError("Must be a member of the board!")
        return super().create(validated_data)


class CardSerializer(serializers.ModelSerializer):
    lane = serializers.PrimaryKeyRelatedField(queryset=Lane.objects.all())
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, required=False
    )
    assignees = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )

    class Meta:
        model = Card
        fields = [
            "id",
            "title",
            "description",
            "priority",
            "tags",
            "assignees",
            "order",
            "lane",
            "created_at",
            "updated_at",
        ]

    def extra_validation(self, board=None, tags=None, assignees=None, user=None):
        if tags and board:
            for tag in tags:
                if tag.board != board:
                    raise serializers.ValidationError(
                        "Can't set a tag that doesn't belong to the board!"
                    )
        if assignees and board:
            for assignee in assignees:
                if assignee not in board.members.all():
                    raise serializers.ValidationError(
                        "Can't assign someone who isn't a board member!"
                    )
        if user and user not in board.members.all():
            raise serializers.ValidationError("Must be a member of the board!")

    def update(self, instance, validated_data):
        tags = validated_data.get("tags")
        assignees = validated_data.get("assignees")
        board = instance.lane.board
        self.extra_validation(board=board, tags=tags, assignees=assignees)
        return super().update(instance, validated_data)

    def create(self, validated_data):
        user = self.context["request"].user
        board = validated_data["lane"].board
        tags = validated_data["tags"]
        assignees = validated_data["assignees"]
        self.extra_validation(board=board, tags=tags, assignees=assignees, user=user)
        return super().create(validated_data)


class LaneSerializer(serializers.ModelSerializer):
    board = serializers.PrimaryKeyRelatedField(queryset=Board.objects.all())
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = Lane
        fields = ["id", "title", "cards", "order", "board"]

    def create(self, validated_data):
        if self.context["request"].user not in validated_data["board"].members.all():
            raise serializers.ValidationError("Must be a member of the board!")
        return super().create(validated_data)


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["id", "card", "author", "text", "created_at", "updated_at"]


class BoardDetailSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    lanes = LaneSerializer(many=True, read_only=True)
    members = BoardMemberSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Board
        fields = ["id", "name", "owner", "members", "lanes", "tags"]


class MemberSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
