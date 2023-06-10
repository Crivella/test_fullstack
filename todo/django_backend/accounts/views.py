from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.http import JsonResponse
from django.middleware import csrf
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views import generic
from django.views.decorators.csrf import csrf_protect


class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

@csrf_protect
def loginView(request):
    if request.user.is_authenticated:
        return redirect('/accounts/login/success')
    else:
        if request.method == "POST":
            form = AuthenticationForm(data=request.POST)
            if form.is_valid():
                user = authenticate(
                    request,
                    username=form.cleaned_data.get("username"),
                    password=form.cleaned_data.get("password")
                    )
                if user is not None:
                    csrf.rotate_token(request)
                    login(request, user)
                    return redirect('/accounts/login/success')
                
            return JsonResponse({'error': 'Invalid Credentials'}, status=200)
    return JsonResponse({'info': 'User not logged in'}, status=200)

@login_required
def success(request):
    return redirect('/accounts/get-user')

def get_user(request):
    csrf.get_token(request)
    return JsonResponse({'username': request.user.username})