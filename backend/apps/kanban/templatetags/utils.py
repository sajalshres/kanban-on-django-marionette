import decimal
from json import JSONEncoder, dumps
from datetime import date
from django import template
from django.db import models
from django.db.models.fields.files import ImageFieldFile
from django.db.models.query import QuerySet
from django.forms.models import model_to_dict

register = template.Library()

@register.filter(name="jsonencode")
def jsonencode(obj):
    class ObjEncoder(JSONEncoder):
        def default(self, obj, **kwargs):
            if isinstance(obj, date):
                return str(obj)
            elif isinstance(obj, models.Model):
                return model_to_dict(obj)
            elif isinstance(obj, ImageFieldFile):
                if obj:
                    return obj.url
                return None
            elif isinstance(obj, decimal.Decimal):
                return float(obj)
            else:
                return JSONEncoder.default(obj, **kwargs)

    if isinstance(obj, (QuerySet,)):
        obj = list(obj)
    return dumps(obj, cls=ObjEncoder)
