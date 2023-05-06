from django.contrib import admin
from rest_framework.authtoken.admin import TokenAdmin

from .models import TodoItem

TokenAdmin.raw_id_fields = ['user']


class TodoAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'completed')

# Register your models here.
admin.site.register(TodoItem, TodoAdmin)

