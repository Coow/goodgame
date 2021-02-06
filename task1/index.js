console.log("Starting")
document.write(Date())

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

async function getWeatherData() {
    let res = await fetch('https://api.met.no/weatherapi/locationforecast/2.0?lat=-13.9833&lon=33.7833');
    let data = await res.json();
    return data;
}

getWeatherData().then(
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

function createHTMLTable() {
    //console.log("Creating HTML Table")
    console.log(cleanWeatherData)
    weatherTable = document.createElement('table');
    weatherTable.className = 'table'

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
            td.appendChild(document.createTextNode(element[parameter.value]));
            weatherValues.appendChild(td);
        });

        tableBody.appendChild(weatherValues)
    });

    weatherTable.appendChild(tableBody);
    return;
}

function createFlexGrid(){
    parentDiv = document.createElement('div');
    parentDiv.className = "flexgrid";
    document.body.appendChild(parentDiv);

    cleanWeatherData.forEach(element => {
        displayDiv = document.createElement('div');
        parentDiv.appendChild(displayDiv);

        createTextElement('h3', element.time, displayDiv, 'time');
        createTextElement('h4', element.air_temperature + ' °C', displayDiv, 'temperatue');
        createTextElement('h4', element.wind_speed, displayDiv, 'windSpeed');
        createTextElement('h4', element.wind_direction, displayDiv, 'windDirection');
        createTextElement('h4', element.humidity, displayDiv, 'humidity');
        createTextElement('h4', element.precipitation, displayDiv, 'precipitation');

        var imgElement = document.createElement('img');
        imgElement.setAttribute('src', `weather_icons/${element.weatherIcon}.png`);
        imgElement.className = 'weatherIcon'
        displayDiv.appendChild(imgElement);
    });
}

function getPrecipitation(json) {
    console.log(json)
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

//Create a HTML element with text value and a class
function createTextElement(elementType, elementValue, parent, className){
    element = document.createElement(elementType);
    value = document.createTextNode(elementValue);
    if(className != undefined) {
        element.className = className;
    }

    element.appendChild(value);
    parent.appendChild(element);
}