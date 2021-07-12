import os
from config.settings import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "PORT": os.environ.get("POSTGRES_PORT"),
        "HOST": os.environ.get("POSTGRES_HOST"),
        "NAME": os.environ.get("POSTGRES_DB"),
        "USER": os.environ.get("POSTGRES_USER"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD"),
    }
}
