from django.middleware import csrf
from rest_framework.decorators import action as drf_action
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from apps.profile.serializers import UserSerializer


def initial_data(request):
    data = {"csrftoken": csrf.get_token(request)}

    if not request.user.is_authenticated:
        return data

    data.update(
        {
            "user": UserSerializer(request.user).data,
            "logged_in": True,
        }
    )

    return data


def action(methods=None, detail=None, url_path=None, url_name=None, **kwargs):
    """Support for using "-" in urls instead of "_" """

    def decorator(func):
        func = drf_action(methods, detail, url_path, url_name, **kwargs)(func)
        if url_path is None:
            func.url_path = func.url_path.replace("_", "-")
        return func

    return decorator


def sort_model(model_class, ordered_ids=[]):

    # Check for duplicates
    if len(ordered_ids) != len(set(ordered_ids)):
        return HTTP_400_BAD_REQUEST

    objects = dict(
        [(str(obj.id), obj) for obj in model_class.objects.filter(id__in=ordered_ids)]
    )
    order_field_name = model_class._meta.ordering[0]

    step = 1
    start_object = min(objects.values(), key=lambda x: getattr(x, order_field_name))
    start_index = getattr(start_object, order_field_name, len(ordered_ids))

    for id in ordered_ids:
        object = objects.get(str(id))
        if getattr(object, order_field_name) != start_index:
            setattr(object, order_field_name, start_index)
            object.save(update_fields=[order_field_name])

        start_index += step

    return HTTP_200_OK
