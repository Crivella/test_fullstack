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
from .serializers import TodoSerializer, UserSerializer

User = get_user_model()

def index(request):
    return render(request, 'todo/index.html')

class OwnerMixin:
    def get_queryset(self):
        q = super().get_queryset()
        q = q.filter(owner=self.request.user.id)
        return q
    
class SortedMixin:
    def get_queryset(self):
        q = super().get_queryset()
        q = q.order_by('completed')
        return q

@csrf_protect
def TodoMapView(request: HttpRequest):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'not authenticated'}, status=401)
    q = TodoListMap.objects
    q = q.filter(owner=request.user.id)
    elem = q.first()
    if elem is None:
        seq = (
            TodoItem.objects
            .filter(owner=request.user.id)
            .order_by('completed')
            .values_list('id', flat=True)
            )
        elem = TodoListMap(owner=request.user, seq=list(seq))
        elem.save()

    if request.method == 'GET':
        return JsonResponse(elem.seq, safe=False)
    elif request.method == 'POST':
        new = json.loads(request.body.decode('utf-8'))
        if not isinstance(new, list):
            return JsonResponse({'error': 'map must be a list'}, status=400)
        elem.seq = new
        elem.save()
        return JsonResponse(elem.seq, safe=False)
    
    return JsonResponse({'error': 'invalid method'}, status=400)
    
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
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class UserView(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
