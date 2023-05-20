from django_filters import FilterSet, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import TodoItem


class TodoFilter(FilterSet):
    order = OrderingFilter(
        fields=(
            ('priority', 'priority'),
            ('title', 'title'),
            ('completed', 'completed'),
        )
    )

    class Meta:
        model = TodoItem
        fields = {
            'completed': ['exact'],
            'private': ['exact'],
            'title': ['icontains', 'exact', 'startswith', 'endswith'],
            'description': ['icontains', 'exact', 'startswith', 'endswith'],
        }
        # ordering = ['priority', 'title', 'completed']


class MyFilterBackend(DjangoFilterBackend):
    def get_filterset(self, request, queryset, view):
        # Allow for negation of filters by prepending a '!' to the filter name in the GET params
        res =  super().get_filterset(request, queryset, view)
        for k in list(res.filters.keys()):
            testkey = f'!{k}'
            if testkey in res.data:
                v = res.filters.pop(k)
                v.exclude = True
                res.filters[testkey] = v

        return res
    