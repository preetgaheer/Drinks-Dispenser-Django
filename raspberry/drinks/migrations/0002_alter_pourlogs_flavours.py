# Generated by Django 4.0.5 on 2022-07-13 12:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('drinks', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pourlogs',
            name='flavours',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
