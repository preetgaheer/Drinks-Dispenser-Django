from django.shortcuts import redirect, render
from django.conf import settings
import os
import json 
from drinks.views import get_form_values_and_send_to_db, read_drinks_json, get_drinks, drinks_data_bytes
currency_symbol = settings.CURRENCY_SYMBOL
json_folder = os.path.join(settings.STATICFILES_DIRS[0]) 

redis_cli = settings.REDIS_CLI


def get_custom_drinks():
        custom_drinks = {'flavours': [], 'components_price': None}
        flavours_json = redis_cli.hgetall('flavours')
        if flavours_json is not None:
                for v in flavours_json.values():
                        f = json.loads(v)
                        if 'flavour_id' in f.keys():
                                custom_drinks["flavours"].append(json.loads(v)) 
                        elif 'co2_per_gram' or "water_per_litre"in f.keys():
                                custom_drinks["components_price"] = json.loads(v) 
        return custom_drinks
        

def custom_drinks_view(request):
        if drinks_data_bytes is None:
                drinks_data = get_drinks(drinks_data_bytes)
                custom_drinks = get_custom_drinks()
        custom_drinks = get_custom_drinks()
        
        if request.method == 'POST':  
                get_form_values_and_send_to_db(request)
                return redirect(request.path)
        custom_drinks["currency_symbol"] = currency_symbol 

        return render(request, "custom_drinks/index.html", context=custom_drinks)