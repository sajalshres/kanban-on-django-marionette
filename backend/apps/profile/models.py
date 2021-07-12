import os

from django.contrib.auth.models import AbstractUser
from django.db import models


class Icon(models.Model):
    image = models.ImageField(upload_to="user-icons")

    def __str__(self) -> str:
        return os.path.basename(self.image.name)


class User(AbstractUser):
    username = models.CharField(
        "username",
        max_length=150,
        unique=True,
        help_text="Required. 150 characters or less",
    )
    icon = models.ForeignKey("Icon", null=True, blank=True, on_delete=models.PROTECT)

    class Meta:
        ordering = ["-id"]
