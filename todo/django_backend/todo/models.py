from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Owned(models.Model):
    owner = models.ForeignKey(User, related_name='%(class)s_owner', on_delete=models.CASCADE)

    class Meta:
        abstract = True

class TodoListMap(Owned):
    seq = models.JSONField(null=True, blank=True)

class TodoItem(Owned):
    title = models.CharField(max_length=256)
    description = models.TextField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return str(self.title)
    