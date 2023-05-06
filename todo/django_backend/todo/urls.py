from django.urls import include, path

from . import views

# from rest_framework import routers


# router = routers.DefaultRouter()
# router.register(r'todo', views.IndexView, 'api_todo')
# router.register(r'user', views.UserView, 'api_user')

app_name = 'todo'
urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    # path("api/", include(router.urls)),
    # path("add/", views.add_todo, name="add_todo"),
]
