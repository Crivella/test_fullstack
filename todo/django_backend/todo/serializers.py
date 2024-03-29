from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import TodoItem, TodoListMap

User = get_user_model()

def create_or_update_map(instance, map, prepend=False):
    if not hasattr(instance, 'child_map'):
        TodoListMap.objects.create(
            owner=instance.owner,
            parent=instance,
            seq=[]
        )
    if prepend:
        map = map + instance.child_map.seq
    instance.child_map.seq = map
    instance.child_map.save()

class OwnedSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        abstract = True

class TodoSerializer(OwnedSerializer):
    count_childrens = serializers.ReadOnlyField()
    count_completed = serializers.ReadOnlyField()
    first_completed = serializers.ReadOnlyField()
    ordered_childrens = serializers.ReadOnlyField()
    shared_with = serializers.ReadOnlyField()
    owner = serializers.ReadOnlyField(source='owner.username')
    parent = serializers.IntegerField(source='parent.id', required=False)
    map = serializers.JSONField(required=False, source='child_map.seq')
    title = serializers.CharField(required=False, allow_blank=True, max_length=256)

    class Meta:
        model = TodoItem
        fields = (
            'id', 'owner', 'title', 'description', 
            'favorite', 'completed', 'private',
            'parent', 'map', 
            'shared_with',
            'ordered_childrens', 'count_childrens', 'count_completed', 'first_completed'
            )

    def update(self, instance, validated_data):
        print('UPDATE:', validated_data)
        if 'child_map' in validated_data:
            create_or_update_map(instance, validated_data.pop('child_map')['seq'])

        if 'parent' in validated_data:
            instance.parent_id = validated_data.pop('parent')['id']

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
    def create(self, validated_data):
        print('CREATE:', validated_data)
        parent_id = validated_data.pop('parent', {'id': None})['id']
        todo = TodoItem.objects.create(parent_id=parent_id, **validated_data)
        if todo.parent is not None:
            todo.private = todo.parent.private
        todo.save()
        if parent_id is not None:
            create_or_update_map(todo.parent, [todo.id], prepend=True)
        return todo  

class TodoMapSerializer(OwnedSerializer):
    class Meta:
        model = TodoListMap
        fields = ('id', 'seq',)

class UserSerializer(serializers.ModelSerializer):
    # todo_items = serializers.PrimaryKeyRelatedField(many=True, queryset=TodoItem.objects.all())

    class Meta:
        model = User
        fields = ('id', 'username')