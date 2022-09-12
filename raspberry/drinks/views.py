from django.shortcuts import render, redirect
from django.conf import settings
import os
import json
from .models import PourLogs
import copy

currency_symbol = settings.CURRENCY_SYMBOL

#json folder path
static_folder = os.path.join(settings.STATICFILES_DIRS[0])

def read_drinks_json(static_folder, name):
        '''
        Read all the json files in json_path and sort it in Alphanumeric sequence.
        ''' 
        drinks_list = {name: [], 'components_price' : None}
        json_drinks_path = static_folder+ f'{name}/data/'
        json_carbonation_price_path = static_folder +'components_price/components_price.json'
        json_station_path = static_folder + 'station/station.json'
        files_list = os.listdir(json_drinks_path)
        if (len(files_list)>0): 
                for path in sorted(files_list, key=str):
                        if os.path.isfile(os.path.join(json_drinks_path, path)) and path.endswith('.json'):
                                with open(json_drinks_path + path) as file:
                                        drinks_list[name].append(json.load(file))  
        with open(json_carbonation_price_path) as f:
                drinks_list["components_price"] = json.load(f)       
                with open(json_station_path) as s:
                        station = json.load(s) 
                        for r in station: 
                                if r.get('flavour_id') != None:
                                        for d in drinks_list[name]:
                                                if name == 'flavours':
                                                        if d['flavour_id'] == r['flavour_id']:
                                                                d["remaining_ml"] =  r['remaining_ml']
                                                else:
                                                        for fla in d['flavours']:
                                                                if fla['flavour_id'] == r['flavour_id']:
                                                                        fla["remaining_ml"] =  r['remaining_ml']
                                elif r.get('remaining_co2') != None:
                                        drinks_list['components_price']['remaining_co2'] = r["remaining_co2"]                          
        return drinks_list 

        
def edit_json(flavour_id, qty):
        new_data = []
        with open(static_folder + '/station/station.json') as file:
                temp =  json.load(file)
        for entry in temp:
                if entry.get('remaining_ml') != None and flavour_id !='co2':
                        if entry['flavour_id'] == flavour_id:
                                remaining_ml = qty
                                new_data.append({ 
                                         "station_id": entry["station_id"],
                                         "flavour_id": entry["flavour_id"],
                                         "remaining_ml":float(remaining_ml),})
                        else:
                               new_data.append(entry)
                elif entry.get('remaining_co2') != None and flavour_id =='co2':
                        new_data.append({ 
                                         "station_id": entry["station_id"],
                                         "remaining_co2":float(qty),})
                
                else:
                        new_data.append(entry)
        if len(new_data) != 0:
                with open(static_folder + '/station/station.json', "w") as f:
                        json.dump(new_data, f, indent=4)
        
redis_cli = settings.REDIS_CLI
    
drinks_data_bytes = redis_cli.get('drinks')

def get_drinks(drinks_data_bytes):
        if drinks_data_bytes == None:
                drinks_data = read_drinks_json(static_folder, "drinks")
                for drink in drinks_data['drinks']:
                        for flavour in drink["flavours"]:
                                flavour_id = flavour['flavour_id']
                                flavour_details = redis_cli.hget("flavours", flavour_id)
                                if flavour_details is not None:
                                        flavour_details = json.loads(flavour_details)  
                                        flavour['price_per_ml'] = flavour_details["price_per_ml"]
                                        flavour['flavour_name'] = flavour_details['flavour_name']
                                        flavour['remaining_ml'] = flavour_details['remaining_ml']
                                        flavour['max_ml_per_litre'] = flavour_details['max_ml_per_litre'] 
                                        flavour['image_path'] = flavour_details['image_path']     
                                else:
                                        flavours_data = read_drinks_json(static_folder, "flavours")
                                        for f in flavours_data["flavours"]:
                                                redis_cli.hset('flavours', f['flavour_id'], json.dumps(f))     
                                                if flavour["flavour_id"] == f["flavour_id"]:
                                                        flavour['price_per_ml'] = f["price_per_ml"] 
                                                        flavour['flavour_name'] = f["flavour_name"] 
                                                        flavour['remaining_ml'] = f["remaining_ml"] 
                                                        flavour['image_path'] = f['image_path']
                                                        flavour['max_ml_per_litre'] = f['max_ml_per_litre']
                                        redis_cli.hset('flavours', 'components_price', json.dumps(flavours_data['components_price']))   
                redis_cli.set('drinks', json.dumps(drinks_data))
        else:
                drinks_data = json.loads(drinks_data_bytes)
        return drinks_data

drinks_data = get_drinks(drinks_data_bytes)

threshold_values = drinks_data['components_price']["threshold_values"]

def remove_image_path_from_flavours(flavours_selected):
        flavours_selected_filtered = json.loads(copy.deepcopy(flavours_selected))
        #*check if flavours is only co2
        if isinstance(flavours_selected_filtered, list):
                for f in flavours_selected_filtered:
                        if isinstance(f, dict):
                                if f.get('image_path') is not None:
                                        #p: delete image_path
                                        f.pop('image_path', None)
        return flavours_selected_filtered

def update_flavours(flavours_selected, carbonation_selected, components_price):
        is_flavours_threshold_reach = False
        if type(carbonation_selected) != float and type(carbonation_selected) != int:
                if len(carbonation_selected) == 0:
                        carbonation_selected = 0

        #p:i: updatePy remaining_co2 value in drinks data(change)(co2)
        drinks_data['components_price']['remaining_co2'] -= carbonation_selected
        #r: load components_price(old/new) from redis
        components_price = json.loads(redis_cli.hget('flavours', "components_price"))
        #p:i: updatePy remainig co2 value in components_price(update) 
        components_price['remaining_co2'] -= carbonation_selected
        
        #rw:i: setRed new value of co2(new) in flavours_data
        redis_cli.hset('flavours', "components_price" , json.dumps(components_price))
        #rw:i: setRed co2(new) in drinks in redis
        redis_cli.set('drinks', json.dumps(drinks_data))
        for f in json.loads(flavours_selected):
                        #*check if flavours is only co2
                        if isinstance(f, dict):
                                if f.get('flavour_id') is not None:
                                        #rw:i: setRed flavours(update) in redis
                                        redis_cli.hset('flavours', f['flavour_id'], json.dumps(f))
                                        #* iterate drink in drinks_data
                                        for drink in drinks_data['drinks']:
                                                for flavour in drink["flavours"]:
                                                        #p: get the flavour id in order to get latest flavours values from redis
                                                        flavour_id = flavour['flavour_id']
                                                        #r: get flavours(new) from redis
                                                        flavour_details = redis_cli.hget("flavours", flavour_id)
                                                        if flavour_details is not None:
                                                                #* covert flavour from redis into dictionary
                                                                flavour_details = json.loads(flavour_details)
                                                                #i: updatePy flavours(update) in drinks_data
                                                                flavour['price_per_ml'] = flavour_details["price_per_ml"]
                                                                flavour['flavour_name'] = flavour_details['flavour_name']
                                                                flavour['remaining_ml'] = flavour_details['remaining_ml']
                                                                flavour['image_path'] = flavour_details['image_path']
                                                                flavour['max_ml_per_litre'] = flavour_details['max_ml_per_litre']
                                        #* check if flavour coming from front-end is below threshold
                                        if (float(f["remaining_ml"]) <= threshold_values['flavours']):
                                                is_flavours_threshold_reach = True  

        #*check if co2(new) in components_price below than threshold
        if components_price['remaining_co2'] <= threshold_values['co2'] or is_flavours_threshold_reach:
                #r: read all flavours(new) and components_price(new) from redis
                flavours_data = redis_cli.hgetall('flavours')
                #p: rebuild flavours_data 
                rebuild_flavours_data = {"components_price": None, "flavours" : []}
                #p: load components_price from "getall" flavours_data and put in "rebuild_flavours_data" 
                rebuild_flavours_data['components_price'] = json.loads(flavours_data['components_price'])
                #p: delete components_price from "getall" flavours_data(old)
                del flavours_data['components_price']
                #* iterate only in flavours from getall flavours(old)
                for f in flavours_data.values():
                        #p: put flavours in rebuild_flavours(old)
                        rebuild_flavours_data['flavours'].append(json.loads(f))
                #j: write flavours(old) in json
                for f in rebuild_flavours_data['flavours']:
                        edit_json(f["flavour_id"], f["remaining_ml"]) 
                #j: write co2(new) in json    
                edit_json("co2", components_price['remaining_co2'])
                #r: flush all redis
                redis_cli.flushall()
        

def get_form_values_and_send_to_db(request):
        drink_selected = str(request.POST['drink_selected'])
        final_price = float(request.POST['final_price'])
        quantity_selected = float(request.POST['inlineRadioOptions'])
        if not request.POST['drink_id']:
                drink_id = None
        else:
                drink_id = int(request.POST['drink_id'])

        #f: carbonation(coming) value from front-end
        carbonation_selected = request.POST['computed_carbonation_qty_value']
        if len(carbonation_selected) > 0:
                carbonation_selected= float(carbonation_selected)
                
        if type(carbonation_selected) != float and type(carbonation_selected) != int:
                if len(carbonation_selected) == 0:
                        carbonation_selected = 0

        #r: load components_price(old) from redis
        drinks_data = get_drinks(drinks_data_bytes)
        components_price = json.loads(redis_cli.hget('flavours', "components_price"))
       
        #f: flavours(coming) from front-end 
        flavours_selected = request.POST['flavours_selected']

        if not request.POST['flavours_selected'] or request.POST['flavours_selected']=='[]':
                flavours_selected_filtered = None
        else:   
                #f: filter image_path from flavour_data(new)
                flavours_selected_filtered = remove_image_path_from_flavours(flavours_selected)
                
                #f: iterate into flavours selected coming from frontend       
                update_flavours(flavours_selected ,carbonation_selected, components_price) 
        
        new_pour = PourLogs(
        drink_id = drink_id,
        drink_name = drink_selected,
        dispensed_time = 10.25, 
        price = final_price,
        carbonation = carbonation_selected,
        quantity = quantity_selected, 
        flavours = flavours_selected_filtered,
        )
        new_pour.save()
   
def drinks_view(request):
        if request.method== 'POST':
                get_form_values_and_send_to_db(request)
                return redirect(request.path)
        drinks_data['currency_symbol'] = currency_symbol   
        return render(request, "drinks/index.html", context=drinks_data)