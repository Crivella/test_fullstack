from django.db import models

class Owned(models.Model):
    owner = models.ForeignKey('auth.User', related_name='%(class)s_owner', on_delete=models.CASCADE)

    class Meta:
        abstract = True

class TodoListMap(Owned):
    seq = models.JSONField(null=True, blank=True)

class TodoItem(Owned):
    title = models.CharField(max_length=256)
    description = models.TextField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    previous = models.ForeignKey('self', related_name='previous_item', null=True, blank=True, on_delete=models.SET_NULL)


    # priority = models.IntegerField(null=False, blank=False, default=1)

    # private = models.BooleanField(default=False)


    def __str__(self):
        return str(self.title)
    