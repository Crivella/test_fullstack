from django.urls import path

from .views import SignUpView, get_user, loginView, success

urlpatterns = [
    path("get-user/", get_user, name="get-user"),
    path("signup/", SignUpView.as_view(), name="signup"),
    path("login/", loginView, name="login"),
    path("login/success", success, name="login-success"),
]