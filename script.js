alert("WeatherSphere Pro Loaded!");

const apiKey = "a517bd71a71c50f36443c6372b0d88e8";

// INPUTS
const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

// MAIN WEATHER
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");

// DETAILS
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

// EXTRA
const greeting = document.getElementById("greeting");
const localTime = document.getElementById("localTime");
const weatherQuote =
    document.getElementById("weatherQuote");
const forecastContainer = document.getElementById("forecastContainer");

let clockInterval = null;
let currentWeather = "";

// EVENTS
searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        getWeather();

    }

});

locationBtn.addEventListener("click", getLocationWeather);

// ===========================
// GET WEATHER BY CITY
// ===========================

async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {

        alert("Please enter a city.");

        return;

    }

    const url =
`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error("City not found");

        }

        const data = await response.json();

        updateCurrentWeather(data);

    }

    catch(error){

        alert(error.message);

    }

}

// ===========================
// GET WEATHER FROM LOCATION
// ===========================

function getLocationWeather() {

    if (!navigator.geolocation) {

        alert("Geolocation not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        async(position)=>{

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const url =
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

            try{

                const response = await fetch(url);

                const data = await response.json();

                updateCurrentWeather(data);

            }

            catch{

                alert("Unable to fetch location weather.");

            }

        },

        ()=>{

            alert("Location permission denied.");

        }

    );

}
// ===========================
// UPDATE WEATHER
// ===========================

function updateCurrentWeather(data) {

    currentWeather = data.weather[0].main;

    cityName.textContent = data.name;

    temperature.textContent =
        Math.round(data.main.temp) + "°C";

    description.textContent =
        data.weather[0].description;

    weatherIcon.textContent =
        getWeatherEmoji(currentWeather);
    
updateQuote(currentWeather);


    humidity.textContent =
        data.main.humidity + "%";

    wind.textContent =
        Math.round(data.wind.speed) + " m/s";

    pressure.textContent =
        data.main.pressure + " hPa";

    visibility.textContent =
        (data.visibility / 1000).toFixed(1) + " km";

    const sunriseTime = new Date(data.sys.sunrise * 1000);

    const sunsetTime = new Date(data.sys.sunset * 1000);

    sunrise.textContent =
        sunriseTime.toLocaleTimeString([], {

            hour: "2-digit",
            minute: "2-digit"

        });

    sunset.textContent =
        sunsetTime.toLocaleTimeString([], {

            hour: "2-digit",
            minute: "2-digit"

        });

    startClock(data.timezone);

    getForecast(data.name);

}

// ===========================
// 5 DAY FORECAST
// ===========================

async function getForecast(city){

    const url =
`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try{

        const response = await fetch(url);

        if(!response.ok) return;

        const data = await response.json();

        displayForecast(data.list);

    }

    catch(error){

        console.log(error);

    }

}

function displayForecast(list){

    forecastContainer.innerHTML = "";

    const days = [];

    list.forEach(item=>{

        if(item.dt_txt.includes("12:00:00")){

            days.push(item);

        }

    });

    days.slice(0,5).forEach(day=>{

        const date = new Date(day.dt_txt);

        const dayName =
            date.toLocaleDateString("en-US",{

                weekday:"short"

            });

        forecastContainer.innerHTML += `

        <div class="forecast-card">

            <p>${dayName}</p>

            <div>${getWeatherEmoji(day.weather[0].main)}</div>

            <span>${Math.round(day.main.temp)}°C</span>

        </div>

        `;

    });

}

// ===========================
// WEATHER ICONS
// ===========================

function getWeatherEmoji(weather){

    switch(weather){

        case "Clear":
            return "☀️";

        case "Clouds":
            return "☁️";

        case "Rain":
            return "🌧️";

        case "Drizzle":
            return "🌦️";

        case "Thunderstorm":
            return "⛈️";

        case "Snow":
            return "❄️";

        case "Mist":
        case "Fog":
        case "Haze":
            return "🌫️";

        default:
            return "🌤️";

    }

}
// ===========================
// LIVE CLOCK
// ===========================

function startClock(timezone){

    clearInterval(clockInterval);

    function updateClock(){

        const now = new Date();

        const utc =
            now.getTime() + now.getTimezoneOffset() * 60000;

        const cityTime =
            new Date(utc + timezone * 1000);

        localTime.textContent =
            cityTime.toLocaleTimeString([],{
                hour:"2-digit",
                minute:"2-digit",
                second:"2-digit"
            });

        const hour = cityTime.getHours();

        // Greeting
        if(hour >= 5 && hour < 12){

            greeting.textContent = "🌅 Good Morning";

        }

        else if(hour >= 12 && hour < 17){

            greeting.textContent = "☀️ Good Afternoon";

        }

        else if(hour >= 17 && hour < 20){

            greeting.textContent = "🌇 Good Evening";

        }

        else{

            greeting.textContent = "🌙 Good Night";

        }

        changeBackground(currentWeather, hour);

    }

    updateClock();

    clockInterval = setInterval(updateClock,1000);

}

// ===========================
// SMART BACKGROUND
// ===========================

function changeBackground(weather,hour){

    document.body.classList.remove(
        "clear-day",
        "clear-night",
        "clouds-day",
        "clouds-night",
        "rain-day",
        "rain-night",
        "snow-day",
        "snow-night"
    );

    const isNight = hour >= 20 || hour < 6;

    switch(weather){

        case "Clear":
            document.body.classList.add(
                isNight ? "clear-night" : "clear-day"
            );
            break;

        case "Clouds":
            document.body.classList.add(
                isNight ? "clouds-night" : "clouds-day"
            );
            break;

        case "Rain":
        case "Drizzle":
        case "Thunderstorm":
            document.body.classList.add(
                isNight ? "rain-night" : "rain-day"
            );
            break;

        case "Snow":
            document.body.classList.add(
                isNight ? "snow-night" : "snow-day"
            );
            break;

        default:
            document.body.classList.add(
                isNight ? "clear-night" : "clear-day"
            );

    }

}
function updateQuote(weather){

    let quote = "";

    switch(weather){

        case "Clear":

            quote =
            "☀️ Every sunrise brings a new beginning.";

            break;

        case "Clouds":

            quote =
            "☁️ Even behind the clouds, the sun is still shining.";

            break;

        case "Rain":

        case "Drizzle":

            quote =
            "🌧️ Life isn't about waiting for the storm to pass—it's about learning to dance in the rain.";

            break;

        case "Thunderstorm":

            quote =
            "⛈️ Every storm eventually runs out of rain.";

            break;

        case "Snow":

            quote =
            "❄️ Snow reminds us that every season has its own beauty.";

            break;

        case "Mist":

        case "Fog":

        case "Haze":

            quote =
            "🌫️ Sometimes the path isn't clear, but keep moving forward.";

            break;

        default:

            quote =
            "🌍 Wherever you are, make today amazing.";

    }

    weatherQuote.textContent = quote;

}

