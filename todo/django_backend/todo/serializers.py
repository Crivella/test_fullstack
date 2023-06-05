from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import TodoItem, TodoListMap

User = get_user_model()

class OwnedSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        abstract = True

class TodoSerializer(OwnedSerializer):
    todo_list = serializers.IntegerField(source='todo_list.id')
    class Meta:
        model = TodoItem
        fields = ('id', 'title', 'description', 'completed', 'todo_list')

    def create(self, validated_data):
        todo_list_id = validated_data.pop('todo_list')['id']
        todo_list = TodoListMap.objects.get(pk=todo_list_id)
        todo = TodoItem.objects.create(todo_list=todo_list, **validated_data)
        return todo

class TodoMapSerializer(OwnedSerializer):
    total = serializers.ReadOnlyField(source='items.count')
    completed = serializers.ReadOnlyField(source='count_completed')
    first_completed = serializers.ReadOnlyField()
    class Meta:
        model = TodoListMap
        fields = ('id', 'name', 'seq', 'completed', 'total', 'first_completed')

class UserSerializer(serializers.ModelSerializer):
    # todo_items = serializers.PrimaryKeyRelatedField(many=True, queryset=TodoItem.objects.all())

    class Meta:
        model = User
        fields = ('id', 'username')