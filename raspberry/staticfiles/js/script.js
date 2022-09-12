jQuery("#carousel").owlCarousel({
    autoplay: false,
    rewind: true, /* use rewind if you don't want loop */
    margin: 20,
    navText: [
        "<i class='fa  fa-chevron-circle-left' aria-hidden='true'></i>",
        "<i class='fa  fa-chevron-circle-right' aria-hidden='true'></i>"
      ],
    responsiveClass: true,
    autoHeight: true,
    dots: false,
    autoplayTimeout: 7000,
    smartSpeed: 800,
    nav: true,
    responsive: {
      0: {  
        items: 1
      },
  
      600: {
        items: 4
      },
  
      1024: {
        items: 4
      },
  
      1366: {
        items: 4
      }
    }
  })


// First let's set the colors of our sliders
const settings={
    fill: '#6ba643',
    background: '#d7dcdf'
  }

function slider(){
    // First find all our sliders
    const sliders = document.querySelectorAll('.range-slider');
  
    // Iterate through that list of sliders
    // ... this call goes through our array of sliders [slider1,slider2,slider3] and inserts them one-by-one into the code block below with the variable name (slider). We can then access each of wthem by calling slider
    Array.prototype.forEach.call(sliders,(slider)=>{
      // Look inside our slider for our input add an event listener
    //   ... the input inside addEventListener() is looking for the input action, we could change it to something like change
      slider.querySelector('input').addEventListener('input', (event)=>{
        // 1. apply our value to the span
        slider.querySelector('span').innerHTML = event.target.value + '%';
        // 2. apply our fill to the input
        applyFill(event.target);
      });
      // Don't wait for the listener, apply it now!
      applyFill(slider.querySelector('input'));
    });
    
    // This function applies the fill to our sliders by using a linear gradient background
    function applyFill(slider) {
      // Let's turn our value into a percentage to figure out how far it is in between the min and max of our input
      const percentage = 100*(slider.value-slider.min)/(slider.max-slider.min);
      // now we'll create a linear gradient that separates at the above point
      // Our background color will change here
      const bg = `linear-gradient(90deg, ${settings.fill} ${percentage}%, ${settings.background} ${percentage+0.1}%)`;
      slider.style.background = bg;
    }

}

var current_url = window.location.href
var isWebSocketFailed = false


try{
  var componentsPrice = JSON.parse(document.getElementById('components_price').textContent);
  var threshold_values = componentsPrice['threshold_values']
  computedMinimumCo2Percentage = (componentsPrice['minimum_co2_per_litre']/componentsPrice['co2_per_litre'])*100
  var slider_co2_el = document.querySelector("input[name=carbonation_level]")
  slider_co2_el.min = computedMinimumCo2Percentage
  if (componentsPrice['remaining_co2'] <= threshold_values['co2'] ){
    is_out_of_gas = true
  }
}
catch (err){
}

function co2SliderHandler(){
  const co2Slider = document.querySelector('input[name=carbonation_level]')
  const percentage = 100*(co2Slider.value-co2Slider.min)/(co2Slider.max-co2Slider .min);
  const bg = `linear-gradient(90deg, #6ba643 ${percentage}%, #d7dcdf ${percentage+0.1}%)`;
  co2Slider.style.background = bg;
  const co2Span = document.querySelector('span[name=co2SpanPercentage]')
  co2Span.textContent = co2Slider.value + "%"
}
var isCo2Checked = null
var co2LabelTxt  = null
var co2Slider  = null

slider()
if(!current_url.endsWith("maintenance/")|| !current_url.includes("maintenance/")){
  co2SliderHandler()
  isCo2Checked = document.querySelector('input[name=co2Checkbox]').checked
  co2LabelTxt = document.querySelector('label[name=co2Text]')
  co2Slider =  document.querySelector('input[name=carbonation_level]')
  
  !co2Slider.disabled ?  co2LabelTxt.style.color = '#ff0000'
  : co2LabelTxt.style.color = 'grey'
}





var render = function (template, node) {
  if (!node) return;
  node.appendChild(template)
};

try{
  var drinksData = JSON.parse(document.getElementById('drinks_data').textContent);
}
catch (err){
}
try{
  var flavoursData = JSON.parse(document.getElementById('flavours_data').textContent);
}
catch (err){
}

var addedFlavoursList = []
var is_out_of_gas = false
var selectedDrinkInfo = null
var isShowSidePanel = false



try{
  var currency_symbol = JSON.parse(document.getElementById('currency_symbol').textContent);
}
catch (err){
}

try{
  document.getElementById("inlineRadio1").checked = true
}catch(e){}

try{
  var quantitySelected = document.querySelector('input[name=inlineRadioOptions]:checked').value
}catch(e){}

try{
  var carbonationPercentageSelected = document.querySelector('input[name=carbonation_level]').value
}catch(e){}

var carbonationPrice = 0
var waterPrice = 0
var flavoursPrice = 0

var not_available_drinks = []
var flavoursInDrink = ''
var defaultDrinkData = null

function checkBelowThreshold (){
  if (current_url.endsWith("/custom_drinks")|| current_url.includes("custom_drinks")){
    for (let f of flavoursData){
      if ( f['remaining_ml'] <= threshold_values["flavours"]){
        document.querySelector(`button[name=${f.flavour_name.replace(/ /g, '')}]`).disabled = true
        document.querySelector(`img[name=${f.flavour_name.replace(/ /g, '')}]`).className += ' greyout-image'
        document.querySelector(`h2[name=${f.flavour_name.replace(/ /g, '')}_title]`).className = ' title-grey'
      }
    }
  }
  else if (!current_url.endsWith("maintenance/")|| !current_url.includes("maintenance/")){
    for (let drink of drinksData){
      for (let f of drink["flavours"]){
        if ( f['remaining_ml']<= threshold_values["flavours"]){
          not_available_drinks.push(drink['drink_id'])
          imgClassName = document.querySelector(`img[name=preDrink${drink['drink_id']}]`)
          document.querySelector(`h2[name=${drink.drink_name.replace(/ /g, '')}card-title]`).className = 'card-title-grey'
          if (!imgClassName.className.toString().includes(' greyout-image')){
            imgClassName.className += ' greyout-image'
          }
      }
      }
  }
}}

checkBelowThreshold()

function getRoundedValue (val, decimalPlaces){
  roundedValue = Number(Math.round(parseFloat(val + 'e' + decimalPlaces)) + 'e-' + decimalPlaces).toFixed(decimalPlaces)
  return roundedValue
}

function setFormValues(drinkId, drinkSelected, flavoursData, carbonation, water, price){
  document.querySelector('input[name=drink_id]').value = drinkId
  document.querySelector('input[name=drink_selected]').value = drinkSelected
  document.querySelector('input[name=flavours_selected]').value  = flavoursData
  document.querySelector('input[name=final_price]').value = price
  document.querySelector('input[name=computed_carbonation_qty_value]').value = isCo2Checked ? getRoundedValue(computed_co2_qty, 2) : null
}

var defaultDrinkElement = document.querySelector("span[id=preDrinkCounter1]")


function getdefaultDrink(){
  for (let d of drinksData){
    if ( !not_available_drinks.includes(d.drink_id)){
      defaultDrinkElement = document.querySelector(`span[name=preDrink${d.drink_id}]`)
      return 
    }
  }
}

drinksData !== undefined &&  getdefaultDrink()

function preDrinkFlavoursTableMapper(defaultDrinkData){
  for (let f of defaultDrinkData.flavours){
    let tr = document.createElement('tr')
    tr.setAttribute("id", f.flavour_name + '_flavour_row');
    tem =  `      
      <td><div class="price-detail">${f.flavour_name.replace(/ /, "")}</div></td>
      <td><div class="price-detail" name="details_${f.flavour_name.replace(/ /g, '')}_qty">${f.flavour_quantity_ml}ml</div></td>
      <td><div class="price-detail"><span>${currency_symbol}</span><span name="details_${f.flavour_name.replace(/ /g, '')}_price">${getRoundedValue(f.price_per_ml*f.flavour_quantity_ml, 2)}</span></div></td>`
      tr.innerHTML += tem
      render(tr, document.querySelector("tbody[name=details_table]"))
    }
}

function carbonationTableMapper(){
 let tr = document.createElement('tr')
 tr.setAttribute("name", 'co2_table_row');
 tem =`
 <td><div class="price-detail">CO2</div></td>
 <td><div class="price-detail" name="details_co2_qty"></div></td>
 <td><div class="price-detail"><span>${currency_symbol}</span><span name="details_co2_price"></span></div></td>
 `
 tr.innerHTML += tem
 render(tr, document.querySelector("tbody[name=details_table]"))
}
if (current_url.endsWith("/custom_drinks")|| current_url.includes("custom_drinks")){
  carbonationTableMapper()
}



function get_computed_qty(percentage, value){
  return (value/100)*percentage;
}

var computed_co2_qty = 0
var computed_flavours_qty = 0
var flavoursPrice = 0

function calculatePrice(){
  let flavoursPrice = 0
  if (current_url.endsWith('/custom_drinks')){
    getSelectedQuantityOfFlavours()
    for (let flavour of addedFlavoursList){
      computed_flavours_qty = get_computed_qty(flavour.flavour_quantity_ml,
        flavour.max_ml_per_litre*quantitySelected)
        flavoursPrice += computed_flavours_qty*flavour.price_per_ml
        fla_price_in_table = document.querySelector(`span[name=${flavour.flavour_name.replace(/ /g, '')}_price_in_table]`)
        fla_qty_in_table = document.querySelector(`div[name=${flavour.flavour_name.replace(/ /g, '')}_qty_in_table]`)
        fla_price_in_table!==null && (fla_price_in_table.textContent = getRoundedValue(computed_flavours_qty*flavour.price_per_ml, 2))
        fla_qty_in_table!==null && (fla_qty_in_table.innerText = getRoundedValue(computed_flavours_qty, 2) + "ml") 
    }
  } else {
    if (selectedDrinkInfo === null){
      for (let flavour of defaultDrinkData.flavours){
        computed_flavours_qty = get_computed_qty(flavour.flavour_quantity_ml,
          flavour.max_ml_per_litre*quantitySelected)
          flavoursPrice += computed_flavours_qty*flavour.price_per_ml
          fla_price_in_table = document.querySelector(`span[name=details_${flavour.flavour_name.replace(/ /g, '')}_price]`)
          fla_qty_in_table = document.querySelector(`div[name=details_${flavour.flavour_name.replace(/ /g, '')}_qty]`)
          fla_price_in_table!==null && (fla_price_in_table.textContent = getRoundedValue(computed_flavours_qty*flavour.price_per_ml, 2))
          fla_qty_in_table!==null && (fla_qty_in_table.innerText = getRoundedValue(computed_flavours_qty, 2) + "ml")
      }
    }else{
    for (let flavour of selectedDrinkInfo.flavours){
      computed_flavours_qty = get_computed_qty(flavour.flavour_quantity_ml,
      flavour.max_ml_per_litre*quantitySelected)
      flavoursPrice += computed_flavours_qty*flavour.price_per_ml
      fla_price_in_table = document.querySelector(`span[name=details_${flavour.flavour_name.replace(/ /g, '')}_price]`)
      fla_qty_in_table = document.querySelector(`div[name=details_${flavour.flavour_name.replace(/ /g, '')}_qty]`)
      fla_price_in_table!==null && (fla_price_in_table.textContent = getRoundedValue(computed_flavours_qty*flavour.price_per_ml, 2))
      fla_qty_in_table!==null && (fla_qty_in_table.innerText = getRoundedValue(computed_flavours_qty, 2) + "ml") 
    }}
  }
  if (isCo2Checked){
    computed_co2_qty = get_computed_qty(carbonationPercentageSelected, 
    componentsPrice.co2_per_litre*quantitySelected)
  } else {
    computed_co2_qty = 0
  }
    
  carbonationPrice = computed_co2_qty*componentsPrice.co2_per_gram_price
  waterPrice = componentsPrice.water_per_litre_price*quantitySelected
  
  totalPrice = waterPrice + carbonationPrice + flavoursPrice

  totalPriceRounded = getRoundedValue(totalPrice, 2)
  return totalPriceRounded 
}

try{
  defaultDrinkElement.className = "card active active-item"
  let defaultDrinkName = defaultDrinkElement.getAttribute("name"); 
  let defaultDrinkId = defaultDrinkName.replace("preDrink", '')
  defaultDrinkData = drinksData.filter((d)=>{
      return d.drink_id == defaultDrinkId
  })[0]
  document.querySelector("p[name=drink_description]").innerText = defaultDrinkData.description
  carbonationTableMapper()
  preDrinkFlavoursTableMapper(defaultDrinkData)
  let finalPrice = calculatePrice()
  document.querySelector("span[name=details_water_price]").textContent = getRoundedValue(waterPrice, 2)
  document.querySelector("div[name=details_water_qty]").innerText = quantitySelected + 'L'
  document.querySelector("span[name=details_co2_price]").textContent =  getRoundedValue(carbonationPrice, 2)
  document.querySelector("div[name=details_co2_qty]").innerText = computed_co2_qty + 'g'
  setPriceBtnView(finalPrice)
  setFormValues(defaultDrinkData.drink_id, defaultDrinkData.drink_name,
    JSON.stringify(defaultDrinkData.flavours.concat([componentsPrice])), 
    carbonationPercentageSelected, 
    quantitySelected, 
    finalPrice
    )
}
catch(err){
}

function setPriceBtnView(finalPrice){
  document.querySelector('button[name=price_btn]').innerText = 'Pour - ' + currency_symbol + finalPrice
}

if (current_url.endsWith("/custom_drinks")|| current_url.includes("custom_drinks")){
  final_price = calculatePrice()
  setFormValues(null, "Custom Drink", JSON.stringify(componentsPrice) , computed_co2_qty, quantitySelected, final_price)
  setPriceBtnView(final_price)
  document.querySelector("div[name=details_co2_qty]").innerText = computed_co2_qty +'g'
  document.querySelector("span[name=details_co2_price]").textContent = getRoundedValue(carbonationPrice, 2) 
  document.querySelector("span[name=details_water_price]").textContent = getRoundedValue(waterPrice, 2) 
}

function selectedFlavoursQuantiyHandler(value, pricePerMl, name,maxPerLitre ){
  computed_fla_qty = get_computed_qty(value, maxPerLitre*quantitySelected)
  let total_flavour_price =  computed_fla_qty*pricePerMl
  document.querySelector(`span[name=${name.replace(/ /g, '')}_price_in_table]`).textContent = getRoundedValue(total_flavour_price, 2)
  let finalPrice = calculatePrice()
  document.querySelector('button[name=price_btn]').innerText = 'Pour - ' + currency_symbol + finalPrice
  document.querySelector('input[name=final_price]').value = finalPrice
  document.querySelector('input[name=final_price]').value = finalPrice
  document.querySelector(`div[name=${name.replace(/ /g, '')}_qty_in_table]`).innerText = getRoundedValue(computed_fla_qty, 2) + 'ml'
  document.querySelector('input[name=computed_carbonation_qty_value]').value = getRoundedValue(computed_co2_qty, 2)
}

function addedFlavoursHtmlHandler(f){
  addedFlavoursHtml = 
  `
    <h2 class="des-heading-carbo">${f.flavour_name}</h2>
      <li>
        <div class="title-details">
          <button  onclick="removeFlavourHandler(${f.flavour_id}, '${f.flavour_name}')" class="fa fa-minus-circle" aria-hidden="true"></button>
              <img src='${static_url}${f.image_path}'  
              onerror="this.onerror=null; this.src='${static_url}images/placeholder_flavour.png'"
              class="card-img-top image-title img-fluid" alt="${f.flavour_name.toLowerCase()}"/>
                <div class="range-slider Title-details-Range">
                  <input oninput="selectedFlavoursQuantiyHandler(event.target.value, '${f.price_per_ml}', '${f.flavour_name}', ${f.max_ml_per_litre})"  class="range-slider__range" type="range" value="100" min="1" max="100" width="70px" name="addedFlavourQuantityOf${f.flavour_name.replace(/ /g, '')}"/>
                  <span class="range-slider__value">100%</span>
                </div>
        </div>
      </li>
  `
  let div = document.createElement('div')
  div.setAttribute("name", f.flavour_name.replace(/ /g, '') + '_flavour');
  div.innerHTML = addedFlavoursHtml
  render(div, document.querySelector('ul[id=flavours_ul]'));
  slider()
}

function removeFlavourHandler(id, name){
  addedFlavoursList = addedFlavoursList.filter((f)=>{
    return f.flavour_id !== id
  })
  addedFlavoursList.length === 0 && (document.querySelector('h1[name=flavour_not_selected_text]').style.display = '')
  document.querySelector(`button[name=${name.replace(/ /g, '')}]`).disabled = false;
  document.querySelector(`div[name=${name.replace(/ /g, '')}_flavour]`).remove()
  document.querySelector(`tr[name=${name.replace(/ /g, '')}_flavour_row]`).remove()
  let finalPrice = calculatePrice()
  document.querySelector('button[name=price_btn]').innerText = 'Pour - ' + currency_symbol + finalPrice
  document.querySelector('input[name=final_price]').value = finalPrice
  sendCustomFlavoursInput()
  document.querySelector('input[name=computed_carbonation_qty_value]').value = getRoundedValue(computed_co2_qty, 2)
}

function sendCustomFlavoursInput(){
  customFlavoursAdded = ''
  if (  current_url.endsWith('/custom_drinks' )|| current_url.includes("custom_drinks") ){
    if (addedFlavoursList.length > 0){
      for (let f of addedFlavoursList){
        customFlavoursAdded +=f.flavour_name + ' '
      }
    }
    flvaoursAndCompsData = addedFlavoursList.concat([componentsPrice])
    document.querySelector('input[name=flavours_selected]').value = JSON.stringify(addedFlavoursList.concat([componentsPrice]))
  }
}

function addFlavourHandler(id, max_per_litre, price_per_ml){
  let f = flavoursData.find((f)=>{
    return f.flavour_id == id
  })
  !(addedFlavoursList.some((f)=>f.flavour_id == id)) && addedFlavoursList.push(f) 
  document.querySelector('h1[name=flavour_not_selected_text]').style.display = 'none'
  addedFlavoursHtmlHandler(f)
  document.querySelector(`button[name=${f.flavour_name.replace(/ /g, '')}]`).disabled = true;
  let selected_flavour_qty = document.querySelector(`input[name=addedFlavourQuantityOf${f.flavour_name.replace(/ /g, '')}]`).value
  let finalPrice = calculatePrice()
  computed_fla_qty = get_computed_qty(selected_flavour_qty, max_per_litre*quantitySelected)
  let total_flavour_price =  computed_fla_qty*price_per_ml
  fla_table = `
  <td><div class="price-detail">${f.flavour_name.replace(/ /g, '')}</div></td>
  <td><div class="price-detail" name=${f.flavour_name.replace(/ /g, '')+'_qty_in_table'}>${getRoundedValue(computed_fla_qty, 2)+ "ml"}</div></td>
  <td><div class="price-detail"><span>${currency_symbol}</span><span name=${f.flavour_name.replace(/ /g, '')+'_price_in_table'}>${getRoundedValue(total_flavour_price, 2)}</span></div></td>
  `

  let t1 = document.createElement('tr')
  t1.setAttribute("name", f.flavour_name.replace(/ /g, '') + '_flavour_row');
  t1.innerHTML = fla_table
  render(t1, document.querySelector("tbody[name=details_table]"))
  slider()
  document.querySelector('button[name=price_btn]').innerText = 'Pour - ' + currency_symbol + finalPrice
  document.querySelector('input[name=final_price]').value = finalPrice
  sendCustomFlavoursInput()
  document.querySelector('input[name=computed_carbonation_qty_value]').value = getRoundedValue(computed_co2_qty, 2)
}

if (window.location.href.endsWith('/custom_drinks')){
  document.querySelector('input[name=drink_selected]').value = "Custom Drink"
}

function getSelectedQuantityOfFlavours (){
  for (let f of addedFlavoursList){
    trimed_fla_name = f.flavour_name.replace(/ /g, '')
    eval('var ' + trimed_fla_name + 'SelectedQuantity' + '= ' + document.querySelector(`input[name=addedFlavourQuantityOf${trimed_fla_name}]`).value)
    f["flavour_quantity_ml"] = eval(trimed_fla_name + 'SelectedQuantity' )
  }
}

function triggerSidePanel(des, drinkName, drinkId){
  do_nothing = false
  if (not_available_drinks.includes(+drinkId)){
    do_nothing = true
  }
  if (do_nothing == false){
  if (selectedDrinkInfo ===null || selectedDrinkInfo=== undefined){
    for(let f of defaultDrinkData.flavours){
      document.getElementById(`${f.flavour_name}_flavour_row`).remove()
    }
  }else{
    for (let f of selectedDrinkInfo?.flavours){
      document.getElementById(`${f.flavour_name}_flavour_row`).remove()
    }
  }

  collection = document.getElementsByClassName("card active active-item")
  for (let i = 0; i < collection.length; i++) {
    collection[i].className = "card active-item";
  }
  document.querySelector(`span[name=preDrink${drinkId}]`).className = "card active active-item"
  selectedDrinkInfo = drinksData.find((d)=>{
    return d.drink_id == drinkId
  })
  preDrinkFlavoursTableMapper(selectedDrinkInfo)
  flavoursInDrink = ''
  document.querySelector('div[name=sidePanel]').style.display = ""
  document.querySelector("p[name=drink_description]").innerText = selectedDrinkInfo.description
  let finalPrice = calculatePrice()
  document.querySelector('button[name=price_btn]').innerText = 'Pour - ' + currency_symbol + finalPrice
  delete selectedDrinkInfo.flavours['image_path']
  setFormValues(selectedDrinkInfo.drink_id, 
    selectedDrinkInfo.drink_name,
    JSON.stringify(selectedDrinkInfo.flavours.concat([componentsPrice])),
    carbonationPercentageSelected,
    quantitySelected,
    finalPrice
    )
  }
}

if(!current_url.endsWith("maintenance/")|| !current_url.includes("maintenance/")){
  sli = document.querySelector('input[name=carbonation_level]')
  sli.addEventListener('input', carbonationHandler)
}


function carbonationHandler(e){
 if (!isCo2Checked){
  carbonationPercentageSelected = 0
 } else {
   carbonationPercentageSelected = e.target.value
 }

 let finalPrice = calculatePrice()
 computedMinimumCo2Percentage = (componentsPrice['minimum_co2_per_litre']/componentsPrice['co2_per_litre'])*100
//  if (e.target.value <= computedMinimumCo2Percentage){
//    document.querySelector('span[class=range-slider__value-co2]').innerHTML = computedMinimumCo2Percentage + '%';
//    e.target.value = computedMinimumCo2Percentage
//    const percentage = 100*(e.target.value-e.target.min)/(e.target.max-e.target.min);
//    const bg = `linear-gradient(90deg, #6ba643 ${percentage}%, #d7dcdf ${percentage+0.1}%)`;
//    e.target.style.background = bg
//    const co2Span = document.querySelector('span[name=co2SpanPercentage]')
//    co2Span.textContent = co2Slider.value + "%"
//    carbonationPercentageSelected = computedMinimumCo2Percentage
//    finalPrice = calculatePrice()
// } else {
  const percentage = 100*(e.target.value-e.target.min)/(e.target.max-e.target.min);
  const bg = `linear-gradient(90deg, #6ba643 ${percentage}%, #d7dcdf ${percentage+0.1}%)`;
  e.target.style.background = bg
  const co2Span = document.querySelector('span[name=co2SpanPercentage]')
  co2Span.textContent = co2Slider.value + "%"
// }
  document.querySelector('button[name=price_btn]').innerText = 'Pour - ' + currency_symbol + finalPrice
  if (isCo2Checked){
    document.querySelector('div[name=details_co2_qty]').innerText = getRoundedValue(computed_co2_qty, 2) +'g'
    document.querySelector('span[name=details_co2_price]').textContent = getRoundedValue(carbonationPrice, 2)
    document.querySelector('input[name=computed_carbonation_qty_value]').value = getRoundedValue(computed_co2_qty, 2)
  }
  sendCustomFlavoursInput()
  document.querySelector('input[name=final_price]').value = finalPrice
}

function quantityHandler(value){
  quantitySelected = value
  let finalPrice = calculatePrice()

  setFormValues(
    selectedDrinkInfo ? selectedDrinkInfo.drink_id 
    : defaultDrinkData  ? defaultDrinkData.drink_id
    : null
    , 
    selectedDrinkInfo ? selectedDrinkInfo.drink_name 
    : defaultDrinkData ? defaultDrinkData.drink_name
    : "Custom Drink",
    defaultDrinkData ? (JSON.stringify(selectedDrinkInfo ? selectedDrinkInfo.flavours.concat([componentsPrice]) : defaultDrinkData.flavours.concat([componentsPrice])) ): JSON.stringify(componentsPrice), 
    computed_co2_qty,
    value, 
    finalPrice
    )
    setPriceBtnView(finalPrice)
    isCo2Checked && (document.querySelector('div[name=details_co2_qty]').innerText = getRoundedValue(computed_co2_qty, 2) +'g')
    isCo2Checked && (document.querySelector('span[name=details_co2_price]').textContent = getRoundedValue(carbonationPrice, 2))
  document.querySelector('div[name=details_water_qty]').innerText = value+"L"
  document.querySelector('span[name=details_water_price]').textContent = getRoundedValue(waterPrice, 2)
 
  sendCustomFlavoursInput()
  isCo2Checked ? (document.querySelector('input[name=computed_carbonation_qty_value]').value = getRoundedValue(computed_co2_qty, 2)) : null

}


function pourPreDrinkHandler(){
    let form = document.getElementById("pourDrinkForm")
    if (document.querySelector("input[name=flavours_selected]").value.length > 0){
      flavours_selected = JSON.parse(document.querySelector("input[name=flavours_selected]").value)
      componentsIndex = null
    try{
      if(typeof(flavours_selected ) === 'object'){
        onlyFlavours = flavours_selected.filter((value)=>{
           return (value['co2_per_gram_price'] === undefined)
        })
        for (let f of onlyFlavours){
          qty = null
          if ( current_url.endsWith('/custom_drinks') || current_url.includes("custom_drinks")){
            qty = document.querySelector(`div[name=${f.flavour_name.replace(/ /g, '')}_qty_in_table]`).innerText.replace("ml", '')
            f['flavour_quantity_ml'] = qty
            f['remaining_ml'] = getRoundedValue((f['remaining_ml'] - qty), 2)
          } else {
            qty = document.querySelector(`div[name=details_${f.flavour_name.replace(/ /g, '')}_qty]`).innerText.replace("ml", '')
    
            f['flavour_quantity_ml'] = qty
            f['remaining_ml'] = getRoundedValue((f['remaining_ml'] - qty), 2)
          }
          document.querySelector('input[name=flavours_selected').value = JSON.stringify(onlyFlavours.concat([componentsPrice]))
        }
      } 
    } catch(err){
      if(typeof(flavours_selected ) === 'object'){
        document.querySelector('input[name=flavours_selected').value = JSON.stringify(flavours_selected)
        }
      } 
    }
    form.submit()
  
}

let timer, currSeconds = 1;

function resetTimer() {
  clearInterval(timer);
  currSeconds = 1;
  timer = setInterval(startIdleTimer, 1000);
}

function startIdleTimer() {
  if (currSeconds == 900){
    window.location.href = "/";
  }
  /* Increment the
    timer seconds */
  currSeconds++;

}

function modalInnerTextChangeHandler(){
  modalBody = document.querySelector("div[name=modal_inner_text]")
  if (is_out_of_gas && isCo2Checked){
    document.querySelector("div[name=modal_inner_text]").innerText = "Out of gas. Unable to Pour"
    document.querySelector("div[name=modal_inner_text]").style.color = 'red' 
    document.querySelector('button[name=okPourButton]').disabled = true
  }
  else{
    btag = document.querySelector("b[name=bold__total_price]")
    if (btag !==null){
      btag.innerText = ` ${currency_symbol}${totalPriceRounded}`
    }else{

      modalBody.innerText = " Are You Sure? Your total price will be - "
      let b = document.createElement('b')
      b.setAttribute("name", "bold__total_price");
      b.innerText = `${currency_symbol}${totalPriceRounded}`
      render(b, modalBody)
      
    }
    modalBody.style.color = 'black' 
    document.querySelector('button[name=okPourButton]').disabled = false
  }
}

  window.onload = resetTimer;
  document.onmousemove = resetTimer;
  document.onkeydown = resetTimer;
  window.onmousedown = resetTimer;
  window.ontouchstart = resetTimer;
  window.ontouchmove =resetTimer;
  window.onclick = resetTimer;
  window.onkeypress = resetTimer;
  document.onscroll = resetTimer;
  window.onscroll = resetTimer;
  window.onresize= resetTimer;
  window.ondrag = resetTimer;
  window.onkeydown= resetTimer;
  window.onkeyup= resetTimer;
  

  function co2CheckboxHandler(e){
    
    co2Slider.disabled = !co2Slider.disabled
    co2Slider.disabled ? (isCo2Checked = false) : (isCo2Checked= true)
    let finalPrice = calculatePrice()
    const percentage = 100*(co2Slider.value-co2Slider.min)/(co2Slider.max-co2Slider.min);
    !co2Slider.disabled ? (co2Slider.style.background = ` linear-gradient(90deg, grey ${percentage}%, #d7dcdf ${percentage+0.1}%)`)
    : (co2Slider.style.background = `linear-gradient(90deg, grey ${percentage}%, #d7dcdf ${percentage+0.1}%)`)
    !co2Slider.disabled ?  co2LabelTxt.style.color = '#ff0000': co2LabelTxt.style.color = 'grey'
    if (co2Slider.disabled){
      co2Slider.className = 'range-slider__range-grey'
    document.querySelector("tr[name=co2_table_row]").remove()
    } else{
      co2Slider.className = 'range-slider__range'
      //i: add co2 in table
      carbonationTableMapper()
      document.querySelector("span[name=details_co2_price]").textContent =  getRoundedValue(carbonationPrice, 2)
      document.querySelector("div[name=details_co2_qty]").innerText = getRoundedValue(computed_co2_qty, 2) + 'g'
      co2SliderHandler()
    }
  
    setPriceBtnView(finalPrice)
    setFormValues(
      selectedDrinkInfo ? selectedDrinkInfo.drink_id 
      : defaultDrinkData  ? defaultDrinkData.drink_id
      : null
      , 
      selectedDrinkInfo ? selectedDrinkInfo.drink_name 
      : defaultDrinkData ? defaultDrinkData.drink_name
      : "Custom Drink",
      defaultDrinkData ? (JSON.stringify(selectedDrinkInfo ? selectedDrinkInfo.flavours.concat([componentsPrice]) : defaultDrinkData.flavours.concat([componentsPrice])) ): JSON.stringify(addedFlavoursList.concat([componentsPrice])), 
      isCo2Checked ? computed_co2_qty : null,
      quantitySelected, 
      finalPrice
      )
  
  }


  if ( current_url.endsWith('/maintenance') || current_url.includes("maintenance")){
     // Creating new instance of Websocket 

var isSocketConnect = false
let connectTimer, currConnectSeconds = 1;

function resetConnectTimer() {
  clearInterval(connectTimer);
  currConnectSeconds = 1;
  connectTimer = setInterval(startConnectTimer, 1000);
}

function startConnectTimer() {
  if (currConnectSeconds > 3 && isSocketConnect == false){
    connect()
  }
  currConnectSeconds++;
}

function connect (){
  let ws = new WebSocket("ws://localhost:5678/"); 

// Phython Server IP and PORT Address // This method is used when connection established successfully 
ws.onopen = function () { 
    console.log("Connecting to the WebSocket Server");
    ws.send("Hello, Phython Server!!"); 
    //send a message to server once ws is opened. 
    console.log("It's working onopen log / awake"); }; 
    // This method is used to receive data from the server
    messageSecond = 0
    socketTimer = null
    function resetSocketTimer() {
      clearInterval(socketTimer);
      messageSecond = 0;
      socketTimer = setInterval(startTimer, 1000);
    }
    
    function startTimer(){
      if (messageSecond>3){
      document.querySelector("div[name=dot-flashing]").className = "dot-flashing-grey"
      }
      messageSecond++;
    }
    ws.onmessage = function (event) { 
      resetConnectTimer()
      isSocketConnect = true
      // console.log("event", event);
    try { 
      let obj = JSON.parse(event?.data)
      console.log("JSON DATA - RECEIVED FROM SERVER"); 
      document.querySelector("h2[class=data-flow-details1]").innerHTML = `PT1=${obj[0]}bar`
      document.querySelector("h2[class=data-flow-details2]").innerHTML = `PT2=${obj[1]}bar`
      document.querySelector("h2[class=data-flow-details3]").innerHTML = `V1=${obj[2]}bar`
      document.querySelector("div[name=dot-flashing]").className = "dot-flashing"
      resetSocketTimer()
    } 
    catch { 
      document.querySelector("div[name=dot-flashing]").className = "dot-flashing-grey"
      console.log("Object is not received, Message is:: ") } 
};
 // This method is used to log error during connection establishment. 
 ws.onerror = function (error) { 
  isWebSocketFailed = true
  console.log("Error Logged: " + JSON.stringify(error))
  document.querySelector("div[name=dot-flashing]").className = "dot-flashing-grey"
  ; 

//  log error
}; 
// This method is used to close the connection and // this methos will automatically call if there is any error between the connection. 
ws.onclose = function (event) 
{ 
  isSocketConnect = false
  console.log("Web Socket connection closed: ", event); ws.close(); 
document.querySelector("div[name=dot-flashing]").className = "dot-flashing-grey"
};
}

connect()
}
 