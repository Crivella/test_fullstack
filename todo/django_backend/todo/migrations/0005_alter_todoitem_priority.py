# Generated by Django 4.2 on 2023-05-10 22:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0004_alter_todoitem_priority'),
    ]

    operations = [
        migrations.AlterField(
            model_name='todoitem',
            name='priority',
            field=models.IntegerField(default=1),
        ),
    ]
