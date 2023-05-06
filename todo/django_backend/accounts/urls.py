from django.urls import path

from .views import SignUpView, get_user, success

urlpatterns = [
    path("get-user/", get_user, name="get-user"),
    path("signup/", SignUpView.as_view(), name="signup"),
    path("login/success", success, name="login-success"),
]