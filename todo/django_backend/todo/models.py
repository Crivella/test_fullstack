from django.db import models


class TodoItem(models.Model):
    title = models.CharField(max_length=256)
    description = models.TextField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    priority = models.IntegerField(null=False, blank=False, default=1)

    private = models.BooleanField(default=False)

    owner = models.ForeignKey('auth.User', related_name='todo_items', on_delete=models.CASCADE)

    def __str__(self):
        return str(self.title)
