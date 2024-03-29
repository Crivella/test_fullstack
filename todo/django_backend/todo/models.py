from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Owned(models.Model):
    owner = models.ForeignKey(User, related_name='%(class)s_owner', on_delete=models.CASCADE)

    class Meta:
        abstract = True

class TodoListMap(Owned):
    seq = models.JSONField(default=list)

    parent = models.OneToOneField(
        'TodoItem',
        related_name='child_map',
        on_delete=models.CASCADE,
        null=True, blank=True
        )
    
class TodoItem(Owned):
    title = models.CharField(max_length=256)
    description = models.TextField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    favorite = models.BooleanField(default=False)
    private = models.BooleanField(default=False)

    # editors = models.ManyToManyField(User, related_name='%(class)s_editor', blank=True)
    shared = models.ManyToManyField(User, related_name='%(class)s_shared', blank=True)

    parent = models.ForeignKey(
        'self',
        related_name='childrens',
        on_delete=models.CASCADE,
        null=True, blank=True
        )
    
    @property
    def map(self):
        if self.child_map is None:
            return []
        return list(self.child_map.seq)
    
    @property
    def shared_with(self):
        return [_.username for _ in self.shared.all()]
    
    @property
    def ordered_childrens(self):
        fields = ['id', 'title', ('owner', 'owner__username'), 'description', 'completed', 'count_childrens', 'count_completed']
        app = [self.childrens.get(pk=pk) for pk in self.map]

        res = []
        for child in app:
            dct = {}
            for field in fields:
                aname = field
                if isinstance(field, tuple):
                    field, aname = field
                ptr = child
                for f in aname.split('__'):
                    ptr = getattr(ptr, f)
                dct[field] = ptr
            res.append(dct)

        return res
    
    @property
    def count_completed(self):
        return self.childrens.filter(completed=True).count()
    
    @property
    def count_childrens(self):
        return self.childrens.count()
    
    @property
    def first_completed(self):
        m = self.child_map.seq
        l = [_.completed for _ in [self.childrens.get(pk=pk) for pk in list(m)]]
        if True in l:
            return l.index(True)
        return len(l)

    def __str__(self):
        return str(self.title)
    
    def delete(self, *args, **kwargs):
        print('DELETE:', self)
        if self.parent is not None:
            print('DELETE: parent map', self.parent.child_map.seq)
            self.parent.child_map.seq.remove(self.id)
            self.parent.child_map.save()

        super().delete(*args, **kwargs)    