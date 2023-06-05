from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Owned(models.Model):
    owner = models.ForeignKey(User, related_name='%(class)s_owner', on_delete=models.CASCADE)

    class Meta:
        abstract = True

class TodoListMap(Owned):
    name = models.CharField(max_length=256, blank=True, null=True)
    seq = models.JSONField(default=list)

    @property
    def count_completed(self):
        return self.items.filter(completed=True).count()
    
    @property
    def mapped_seq(self):
        return [self.items.get(pk=pk) for pk in list(self.seq)]
    
    @property
    def first_completed(self):
        l = [_.completed for _ in self.mapped_seq]
        if True in l:
            return l.index(True)
        return len(l)
    

class TodoItem(Owned):
    title = models.CharField(max_length=256)
    description = models.TextField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    todo_list = models.ForeignKey(
        TodoListMap, 
        related_name='items', 
        on_delete=models.CASCADE, 
        null=True, blank=True
        )

    def __str__(self):
        return str(self.title)
    