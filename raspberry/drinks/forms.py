from django import forms

class Pourform(forms.Form):
    carbonation_selected = forms.IntegerField(label='carbonation_selected')
    quantity_selected = forms.CharField(label='quantity_selected')
    final_price = forms.FloatField(label='final_price')
    drink_selected = forms.CharField(label='drink_selected')