from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import TodoItem, TodoListMap

User = get_user_model()

class OwnedSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        abstract = True

class TodoSerializer(OwnedSerializer):
    todo_list = serializers.ReadOnlyField(source='todo_list.id')
    class Meta:
        model = TodoItem
        fields = ('id', 'title', 'description', 'completed', 'todo_list')

class TodoMapSerializer(OwnedSerializer):
    class Meta:
        model = TodoListMap
        fields = ('id', 'name', 'seq')

class UserSerializer(serializers.ModelSerializer):
    # todo_items = serializers.PrimaryKeyRelatedField(many=True, queryset=TodoItem.objects.all())

    class Meta:
        model = User
        fields = ('id', 'username')