parameters = [
    {
        displayName: 'Time',
        value: 'time'
    },
    {
        displayName: 'Air Temperature',
        value: 'air_temperature'
    },
    {
        displayName: 'Wind Speed',
        value: 'wind_speed'
    },
    {
        displayName: 'Humidity',
        value: 'humidity'
    },
    {
        displayName: 'Precipitation',
        value: 'precipitation'
    },
    {
        displayName: '',
        value: 'weatherIcon'
    }];

cleanWeatherData = [];

cities = [
    {
        "cityName": "Bergen",
        "lat": 60.39,
        "lon": 5.32
    },
    {
        "cityName": "Oslo",
        "lat": 59.91,
        "lon": 10.75
    },
    {
        "cityName": "Trondheim",
        "lat": 63.4,
        "lon": 10.39
    },
    {
        "cityName": "Stavanger",
        "lat": 58.97,
        "lon": 5.73
    },
    {
        "cityName": "Bodø",
        "lat": 67.28,
        "lon": 14.41
    }
]

async function getWeatherData(lat_lon) {
    let res = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0?${lat_lon}`);
    let data = await res.json();
    return data;
}

function createHTMLTable() {  
    weatherTable = document.createElement('table');
    weatherTable.id = 'table'

    document.body.appendChild(weatherTable);

    //Create Table headers
    parameters.forEach((parameter) => {
        th = document.createElement('th');
        th.appendChild(document.createTextNode(parameter.displayName));
        weatherTable.appendChild(th);
    })

    //Create Table Rows
    tableBody = document.createElement('tbody');

    cleanWeatherData.forEach(element => {
        weatherValues = document.createElement('tr');

        parameters.forEach((parameter) => {
            td = document.createElement('td');
            
            if(parameter.value == 'weatherIcon') {
                createWeatherIconElement(element.weatherIcon,weatherValues);
            } else {
                td.appendChild(document.createTextNode(element[parameter.value]));
                weatherValues.appendChild(td);
            }
        });

        tableBody.appendChild(weatherValues)
    });

    weatherTable.appendChild(tableBody);
    return;
}

function createFlexGrid(){
    parentDiv = document.createElement('div');
    parentDiv.id = "flexgrid";
    parentDiv.style.display = 'flex'
    document.body.appendChild(parentDiv);

    cleanWeatherData.forEach(element => {
        displayDiv = document.createElement('div');
        displayDiv.className = 'weatherDisplay'
        parentDiv.appendChild(displayDiv);

        createTextElement('h2', element.time, displayDiv, 'time');

        createWeatherIconElement(element.weatherIcon,displayDiv);

        createTextElement('h4', `${element.air_temperature} °C`, displayDiv, 'temperature');
        createTextElement('h4', `${element.wind_speed} m/s`, displayDiv, 'windSpeed');

        //Probably take the wind direction and rotate a arrow icon that much
        //createTextElement('h4', element.wind_direction, displayDiv, 'windDirection');

        createTextElement('h4', `Humidity: ${element.humidity}%`, displayDiv, 'humidity');
        createTextElement('h4', `Precipitation: ${element.precipitation}%`, displayDiv, 'precipitation');
    });
}

function getPrecipitation(json) {
    if (json.data.next_1_hours != undefined) {
        return json.data.next_1_hours.details.precipitation_amount;
    }
    if (json.data.next_6_hours != undefined) {
        return json.data.next_6_hours.details.precipitation_amount;
    }
    return "";
};

function getWeatherIcon(json) {
    if (json.data.next_1_hours != undefined) {
        return json.data.next_1_hours.summary.symbol_code;
    }
    if (json.data.next_6_hours != undefined) {
        return json.data.next_6_hours.summary.symbol_code;
    }

    return "";
}

//Create a HTML element with text value and a class with a chosen parent, and optional className
function createTextElement(elementType, elementValue, parent, className){
    element = document.createElement(elementType);
    value = document.createTextNode(elementValue);
    if(className != undefined) {
        element.className = className;
    }

    element.appendChild(value);
    parent.appendChild(element);
}

//Creates the weather icon element, with a chosen parent
function createWeatherIconElement(weatherIcon, parent){
    var imgElement = document.createElement('img');
    //Edge case if the WeatherData didnt have a WeatherIcon
    if(weatherIcon == ""){
        return;
    }
    imgElement.setAttribute('src', `weather_icons/${weatherIcon}.png`);
    imgElement.className = 'weatherIcon'
    parent.appendChild(imgElement);
}

//Toggles between Grid view, and table list view
function toggleDisplayMode(){
    flexgrid = document.getElementById('flexgrid');
    table = document.getElementById('table');

    if(flexgrid.style.display == 'flex') {
        flexgrid.style.display = 'none';
        table.style.display = 'block';
    } else {
        flexgrid.style.display = 'flex';
        table.style.display = 'none';
    }
}

//Creates the dropdow
function createDropdownList(){
    parentSelector = document.getElementById('citySelector');

    cities.forEach(city => {
        option = document.createElement('option');
        option.textContent = city.cityName;
        option.value = `lat=${city.lat}&lon=${city.lon}`

        parentSelector.appendChild(option);
    });
}

//Calls the functions after the page is done loading
window.onload = function(){
    createDropdownList();
    getWeatherForCity();
}

//Gets weather for the selected city in the dropdown menu
function getWeatherForCity(){
    lat_lon = document.getElementById('citySelector').value;
    console.log(lat_lon);

    //Clears the elements
    clearTableAndFlex();

    getWeatherData(lat_lon).then(
        weatherData => {
            weatherData.properties.timeseries.forEach(element => {
                date = new Date(element.time)
    
                cleanWeatherData.push({
                    time: (
                        date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})
                        + " " +
                        date.toLocaleTimeString('en-US',{hour12: false, hour: "numeric", minute: "numeric"})),
                    air_temperature: element.data.instant.details.air_temperature,
                    wind_speed: element.data.instant.details.wind_speed,
                    wind_direction: element.data.instant.details.wind_from_direction,
                    humidity: element.data.instant.details.relative_humidity,
                    precipitation: getPrecipitation(element),
                    weatherIcon: getWeatherIcon(element),
                })
            });
    
            createFlexGrid();
            createHTMLTable();
        }
    )
}

//Clears the table and flexgrid for new city
function clearTableAndFlex(){
    table = document.getElementById('table')
    flexgrid = document.getElementById('flexgrid')
    if(table !== null){
        table.remove();
    }
    if(flexgrid !== null){
        flexgrid.remove();
    }
}