from django.urls import path
from . import views  #importing our view file 

urlpatterns = [
    path("", views.maintenance_screen_view), #mapping the homepage function
]