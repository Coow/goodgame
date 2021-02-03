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
    }];

cleanWeatherData = [];

async function getWeatherData() {
    let res = await fetch('https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=60.3913&lon=5.3221');
    let data = await res.json();
    return data;
}

getWeatherData().then(
    weatherData => {
        weatherData.properties.timeseries.forEach(element => {
            date = new Date(element.time)

            cleanWeatherData.push({
                time: (date.getDate),
                air_temperature: element.data.instant.details.air_temperature,
                wind_speed: element.data.instant.details.wind_speed,
                humidity: element.data.instant.details.relative_humidity,
                precipitation: getPrecipitation(element)               
            })
        });

        createHTMLTable();
    }
)

function createHTMLTable(){
    console.log("Creating HTML Table")
    console.log(cleanWeatherData)
    weatherTable = document.createElement('table');

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

    weatherTable.appendChild(tableBody)
}

function getPrecipitation(json){
    console.log(json)
    if(json.data.next_1_hours != undefined){
        return json.data.next_1_hours.details.precipitation_amount;
    }
    if(json.data.next_6_hours != undefined){
        return json.data.next_6_hours.details.precipitation_amount;
    }
    return "";
}

let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];