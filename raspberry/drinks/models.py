from django.db import models

# Create your models here.
class PourLogs(models.Model):
    drink_id = models.IntegerField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    drink_name = models.CharField(max_length=100)
    dispensed_time = models.FloatField()
    price = models.FloatField() 
    carbonation = models.IntegerField(null=True,  blank=True)
    quantity = models.FloatField()
    flavours = models.JSONField(null=True, blank=True,)
    
    def __str__(self):
        return str(self.drink_name + ' ' + self.date)