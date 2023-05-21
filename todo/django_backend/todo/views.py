# from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views import generic
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie, vary_on_headers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.response import Response

from .filters import MyFilterBackend, TodoFilter
from .models import TodoItem
from .permissions import IsOwnerOrReadOnly
from .serializers import TodoSerializer, UserSerializer


def index(request):
    return render(request, 'todo/index.html')

class IndexView(generic.ListView):
    model = TodoItem
    template_name = 'todo/index.html'
    context_object_name = 'todo_list'

    def get_queryset(self):
        q = super().get_queryset()
        return q.filter(Q(private=False) | Q(owner=self.request.user.id))

class TodoView(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    queryset = TodoItem.objects.all()

    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticatedOrReadOnly]
    # filter_backends = [DjangoFilterBackend]
    filterset_class = TodoFilter
    filter_backends = [MyFilterBackend]
    # filterset_fields = ['completed', 'private']

    # @method_decorator(cache_page(60*2))
    # @method_decorator(vary_on_headers("Authorization", "Cookie"))
    # def list(self, *args, **kwargs):
    #     return super().list(*args, **kwargs)

    def get_queryset(self):
        q = super().get_queryset()
        return q.filter(Q(private=False) | Q(owner=self.request.user.id))
    
    def perform_create(self, serializer):
        if 'priority' in serializer.validated_data:
            priority = serializer.validated_data['priority']
        else:
            priority = TodoItem.objects.order_by('-priority').first().priority + 1
        serializer.save(owner=self.request.user, priority=priority)

class UserView(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
