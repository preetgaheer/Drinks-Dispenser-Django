from django.urls import path
from . import views  #importing our view file 

urlpatterns = [
    path("", views.custom_drinks_view), #mapping the homepage function
]