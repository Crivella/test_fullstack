from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import TodoItem, TodoListMap

User = get_user_model()

class OwnedSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        abstract = True

class TodoSerializer(OwnedSerializer):
    count_childrens = serializers.ReadOnlyField()
    count_completed = serializers.ReadOnlyField()
    first_completed = serializers.ReadOnlyField()
    ordered_childrens = serializers.ReadOnlyField()
    parent = serializers.IntegerField(source='parent.id', required=False)
    map = serializers.JSONField(required=False, source='child_map.seq')
    title = serializers.CharField(required=False, allow_blank=True, max_length=256)

    class Meta:
        model = TodoItem
        fields = ('id', 'title', 'parent', 'completed', 'ordered_childrens', 'map', 'count_childrens', 'count_completed', 'first_completed')

    # def create(self, validated_data):
    #     todo_list_id = validated_data.pop('todo_list')['id']
    #     todo_list = TodoListMap.objects.get(pk=todo_list_id)
    #     todo = TodoItem.objects.create(todo_list=todo_list, **validated_data)
    #     return todo
    def update(self, instance, validated_data):
        print(validated_data)
        if 'child_map' in validated_data:
            if instance.child_map is None:
                new = TodoListMap.objects.create(
                    owner=instance.owner,
                )
                instance.child_map = new
            instance.child_map.seq = validated_data.pop('child_map')['seq']
            instance.child_map.save()

        if 'parent' in validated_data:
            instance.parent_id = validated_data.pop('parent')['id']

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
    def create(self, validated_data):
        print(validated_data)
        parent_id=None
        if 'parent' in validated_data:
            parent_id = validated_data.pop('parent')['id']
        todo = TodoItem.objects.create(parent_id=parent_id, **validated_data)
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