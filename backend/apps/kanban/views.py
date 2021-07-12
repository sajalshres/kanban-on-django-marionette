from itertools import chain

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Prefetch, Q
from rest_framework import mixins
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from django_filters.rest_framework import DjangoFilterBackend


from apps.utils import sort_model, action
from apps.kanban.models import Board, Tag, Lane, Card, Comment
from apps.kanban.permissions import IsOwner, IsOwnerForDangerousMethods
from apps.kanban.serializers import (
    BoardMemberSerializer,
    BoardSerializer,
    TagSerializer,
    CardSerializer,
    LaneSerializer,
    CommentSerializer,
    BoardDetailSerializer,
    MemberSerializer,
)


User = get_user_model()


class BoardViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    GenericViewSet,
):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [IsAuthenticated, IsOwnerForDangerousMethods]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BoardDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        user = self.request.user
        queryset_by_user = super().get_queryset().filter(members=user)
        assignees = self.request.query_params.get("assignees", None)
        if self.action == "retrieve":
            retrieve_queryset = None
            if assignees:
                retrieve_queryset = (
                    Card.objects.filter(
                        Q(assignees__in=[int(x) for x in assignees.split(",")])
                    )
                    .order_by("id")
                    .distinct("id")
                )
            return queryset_by_user.prefetch_related(
                Prefetch("lanes__cards", queryset=retrieve_queryset)
            )
        return queryset_by_user

    def get_member(self):
        try:
            member = User.objects.get(username=self.request.data.get("username"))
        except User.DoesNotExist:
            return None

        return member

    @action(
        detail=True,
        methods=["post"],
        serializer_class=MemberSerializer,
        permission_classes=[IsAuthenticated],
    )
    def invite_member(self, request, pk):
        users_ids = self.request.data.get("users")
        if not users_ids:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        new_members = User.objects.filter(id__in=users_ids)
        if len(new_members) != len(users_ids):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        self.get_object().members.add(*new_members)
        return Response(BoardMemberSerializer(instance=new_members, many=True).data)

    @action(detail=True, methods=["post"], serializer_class=MemberSerializer)
    def remove_member(self, request, pk):
        member = self.get_member()
        board = self.get_object()

        if not member or member == board.owner or board not in member.boards.all():
            return Response(status=status.HTTP_400_BAD_REQUEST)

        board.members.remove(member)
        for card in Card.objects.filter(lane__board=board):
            card.assignees.remove(member)
        return Response(data=BoardMemberSerializer(instance=member).data)


class TagViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    GenericViewSet,
):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(board__members=self.request.user)


class LaneViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    GenericViewSet,
):
    queryset = Lane.objects.all()
    serializer_class = LaneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(board__members=self.request.user)


class CardViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    GenericViewSet,
):
    queryset = Card.objects.all()
    serializer_class = CardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(lane__board__members=self.request.user)


class CommentViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    GenericViewSet,
):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["card"]

    def get_queryset(self):
        return (
            super().get_queryset().filter(card__lane__board__members=self.request.user)
        )

    def create(self, request, *args, **kwargs):
        request.data.update(dict(author=request.user.id))

        if (
            self.request.user
            not in Card.objects.get(
                id=request.data.get("card")
            ).lane.board.members.all()
        ):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        request.data.update(dict(author=request.user.id))

        if self.request.user != self.get_object().author:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return super().destroy(request, *args, **kwargs)


class SortLaneAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, **kwargs):
        try:
            return Response(
                status=sort_model(Lane, ordered_ids=request.data.get("order", []))
            )
        except (
            KeyError,
            IndexError,
            AttributeError,
            ValueError,
            Lane.DoesNotExist,
        ):
            return Response(status=status.HTTP_400_BAD_REQUEST)


class SortCardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def move_cards(self, request):
        cards_by_lane = request.data.get("cards")
        board_id = request.data.get("board")
        board = Board.objects.get(id=board_id)
        pre_lanes = Lane.objects.filter(board=board)
        pre_cards = Card.objects.filter(lane__in=pre_lanes).prefetch_related("lanes")

        # Check for duplicate cards
        flat_cards = list(chain.from_iterable(cards_by_lane.values()))
        if len(flat_cards) != len(set(flat_cards)):
            raise ValueError

        for lane_name, card_ids in cards_by_lane.items():
            lane = pre_lanes.get(id=lane_name)
            cards = pre_cards.filter(pk__in=card_ids)
            cards.update(lane=lane)

    def post(self, request, **kwargs):
        try:
            with transaction.atomic():
                self.move_cards(request)
                return Response(
                    status=sort_model(Card, ordered_ids=request.data.get("order", []))
                )
        except (
            KeyError,
            IndexError,
            AttributeError,
            ValueError,
            Lane.DoesNotExist,
            Card.DoesNotExist,
        ):
            return Response(status=status.HTTP_400_BAD_REQUEST)
