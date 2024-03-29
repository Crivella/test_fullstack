# Generated by Django 4.2 on 2023-06-05 20:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0013_alter_todolistmap_seq'),
    ]

    operations = [
        migrations.AddField(
            model_name='todoitem',
            name='todo_list',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='items', to='todo.todolistmap'),
        ),
    ]
