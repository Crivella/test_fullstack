from django.contrib.auth.models import User
from rest_framework import serializers

from .models import TodoItem, TodoListMap

class OwnedSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        abstract = True

class TodoSerializer(OwnedSerializer):
    priority = serializers.IntegerField(required=False)

    class Meta:
        model = TodoItem
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    # todo_items = serializers.PrimaryKeyRelatedField(many=True, queryset=TodoItem.objects.all())

    class Meta:
        model = User
        fields = ('id', 'username')