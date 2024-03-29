"""todo URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from rest_framework.authtoken import views as token_views

from todo import views as todo_views

router = routers.DefaultRouter()
router.register(r'todo', todo_views.TodoView, 'api_todo')
router.register(r'map', todo_views.TodoMapView, 'api_todo')
router.register(r'user', todo_views.UserView, 'api_user')

urlpatterns = [
    path('admin/', admin.site.urls),
    # path("api/todo/map/", todo_views.TodoMapView),
    path("api/share/", todo_views.share_todo),
    path("api/", include(router.urls)),
    path('todo/', include('todo.urls')),
    path('accounts/', include('accounts.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api-token-auth/', token_views.obtain_auth_token)
]
