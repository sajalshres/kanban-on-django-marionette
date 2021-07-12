from django.views.generic.base import TemplateView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

from apps.utils import initial_data


@method_decorator(ensure_csrf_cookie, name="get")
class AppView(TemplateView):
    template_name = "app.html"

    def get_context_data(self, **kwargs):
        return {
            "initial_data": initial_data(self.request)
        }