# from django.http import HttpResponseRedirect
import json

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.http import HttpRequest, JsonResponse
from django.shortcuts import render
from django.views import generic
from django.views.decorators.cache import cache_page
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.vary import vary_on_cookie, vary_on_headers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.response import Response

from .filters import MyFilterBackend, TodoFilter
from .models import TodoItem, TodoListMap
from .permissions import IsOwner, IsOwnerOrReadOnly
from .serializers import TodoMapSerializer, TodoSerializer, UserSerializer

User = get_user_model()

def index(request):
    return render(request, 'todo/index.html')

class OwnerMixin:
    def get_queryset(self):
        q = super().get_queryset()
        q = q.filter(Q(private=False) | Q(owner=self.request.user.id))
        return q
    
class SortedMixin:
    def get_queryset(self):
        q = super().get_queryset()
        q = q.order_by('completed')
        return q
    
class IndexView(SortedMixin, OwnerMixin, generic.ListView):
    model = TodoItem
    template_name = 'todo/index.html'
    context_object_name = 'todo_list'

class TodoView(SortedMixin, OwnerMixin, viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    queryset = TodoItem.objects.all()

    permission_classes = [IsOwnerOrReadOnly]
    # filter_backends = [DjangoFilterBackend]
    filterset_class = TodoFilter
    filter_backends = [MyFilterBackend]
    # filterset_fields = ['completed', 'private']

    def list(self, request: HttpRequest, *args, **kwargs):
        q = super().get_queryset()
        user = request.GET.get('user', request.user.username)
        q = q.filter(owner__username=user)
        q = q.filter(parent=None)
        return JsonResponse({'ordered_childrens': TodoSerializer(q, many=True).data})
    
    def retrieve(self, request: HttpRequest, *args, pk=None, **kwargs):
        print(list(request.GET.items()))
        user = request.GET.get('user', request.user.username)
        q = super().get_queryset()
        q = q.filter(owner__username=user)
        if pk.lower() == 'favorites':
            print('FAVORITES')
            q = q.filter(favorite=True)
            return JsonResponse({'ordered_childrens': TodoSerializer(q, many=True).data})

        q = q.filter(pk=pk)
        item = q.first()
        return JsonResponse(TodoSerializer(item).data)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    

class TodoMapView(viewsets.ModelViewSet):
    serializer_class = TodoMapSerializer
    queryset = TodoListMap.objects.all()

    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        q = super().get_queryset()
        q = q.filter(owner=self.request.user.id)
        return q

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)



class UserView(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
