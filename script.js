alert("Script loaded!");
const apiKey = "e304ad530139c42a2642880685b4b830";

const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const forecastContainer = document.getElementById("forecastContainer");
const greeting = document.getElementById("greeting");
const localTime = document.getElementById("localTime");
let clockInterval;
searchBtn.addEventListener("click", () => {
    getWeather();
});
locationBtn.addEventListener("click", getLocationWeather);
cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        getWeather();
    }
});

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
            throw new Error("City not found.");
        }

        const data = await response.json();

        updateCurrentWeather(data);

    }

    catch(error){

        alert(error.message);

    }

}
function updateCurrentWeather(data) {

    cityName.textContent = data.name;

    temperature.textContent =
        Math.round(data.main.temp) + "°C";

    description.textContent =
        data.weather[0].description;

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
    weatherIcon.textContent =
        getWeatherEmoji(data.weather[0].main);
changeBackground(data.weather[0].main);
    startClock(data.timezone);
    getForecast(data.name);

}

async function getForecast(city) {

    const url =
`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try {

        const response = await fetch(url);

        if (!response.ok) return;

        const data = await response.json();

        displayForecast(data.list);

    }

    catch(error){

        console.log(error);

    }

}
function displayForecast(forecastList) {

    forecastContainer.innerHTML = "";

    const dailyForecast = [];

    forecastList.forEach(item => {

        if (item.dt_txt.includes("12:00:00")) {

            dailyForecast.push(item);

        }

    });

    dailyForecast.slice(0, 5).forEach(day => {

        const date = new Date(day.dt_txt);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
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

function getWeatherEmoji(weather) {

    switch (weather) {

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
function getLocationWeather() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported by your browser.");
        return;

    }

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const url =
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

            try {

                const response = await fetch(url);

                const data = await response.json();

                updateCurrentWeather(data);

            }

            catch {

                alert("Unable to get your location weather.");

            }

        },

        () => {

            alert("Location permission denied.");

        }

    );

}
function changeBackground(weather) {

    document.body.className = "";

    switch (weather) {

        case "Clear":
            document.body.classList.add("sunny");
            break;

        case "Clouds":
            document.body.classList.add("cloudy");
            break;

        case "Rain":
        case "Drizzle":
        case "Thunderstorm":
            document.body.classList.add("rainy");
            break;

        case "Snow":
            document.body.classList.add("snowy");
            break;

        default:
            document.body.classList.add("night");
            break;

    }

}
function startClock(timezone) {

    clearInterval(clockInterval);

    function updateClock() {

        const now = new Date();

        const utc =
            now.getTime() + now.getTimezoneOffset() * 60000;

        const cityTime =
            new Date(utc + timezone * 1000);

        localTime.textContent =
            cityTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });

        const hour = cityTime.getHours();

        if (hour >= 5 && hour < 12) {

            greeting.textContent = "🌅 Good Morning";

        }

        else if (hour >= 12 && hour < 17) {

            greeting.textContent = "☀️ Good Afternoon";

        }

        else if (hour >= 17 && hour < 20) {

            greeting.textContent = "🌇 Good Evening";

        }

        else {

            greeting.textContent = "🌙 Good Night";

        }

    }

    updateClock();

    clockInterval = setInterval(updateClock, 1000);

}

