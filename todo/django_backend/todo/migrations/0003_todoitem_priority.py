# Generated by Django 4.2 on 2023-05-10 21:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0002_todoitem_private'),
    ]

    operations = [
        migrations.AddField(
            model_name='todoitem',
            name='priority',
            field=models.IntegerField(null=True, unique=True),
        ),
    ]
