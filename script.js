// script.js
const apiKey = "3045dd712ffe6e702e3245525ac7fa38";
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const forecastDisplay = document.getElementById('forecastDisplay');
const recentSearches = document.getElementById('recentSearches');

let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

function updateRecentSearches() {
  recentSearches.innerHTML = '';
  if (searchHistory.length === 0) return;
  const dropdown = document.createElement('select');
  dropdown.className = 'p-2 rounded-md border';
  dropdown.innerHTML = '<option>Select a recent city</option>' +
    searchHistory.map(city => `<option value="${city}">${city}</option>`).join('');

  dropdown.addEventListener('change', (e) => {
    if (e.target.value !== 'Select a recent city') {
      getWeather(e.target.value);
    }
  });
  recentSearches.appendChild(dropdown);
}

// Fetch weather by city
function getWeather(city) {
  if (!city) return alert('Please enter a valid city name');

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) throw new Error(data.message);
      displayWeather(data);
      if (!searchHistory.includes(city)) {
        searchHistory.unshift(city);
        if (searchHistory.length > 5) searchHistory.pop();
        localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
        updateRecentSearches();
      }
      getForecast(city);
    })
    .catch(err => alert('Error: ' + err.message));
}

// Current weather
function displayWeather(data) {
  const html = `
    <h2 class="text-xl font-bold">${data.name}, ${data.sys.country}</h2>
    <p class="text-lg">${data.weather[0].main} - ${data.weather[0].description}</p>
    <p>🌡️ Temperature: ${data.main.temp} °C</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>💨 Wind: ${data.wind.speed} m/s</p>
  `;
  weatherDisplay.innerHTML = html;
}

function getForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      forecastDisplay.innerHTML = '';
      const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
      dailyData.slice(0, 5).forEach(day => {
        const date = new Date(day.dt_txt).toLocaleDateString();
        forecastDisplay.innerHTML += `
          <div class="bg-white p-4 rounded-md shadow text-center">
            <h3 class="font-bold">${date}</h3>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon">
            <p>${day.weather[0].main}</p>
            <p>🌡️ ${day.main.temp} °C</p>
            <p>💨 ${day.wind.speed} m/s</p>
            <p>💧 ${day.main.humidity}%</p>
          </div>`;
      });
    })
    .catch(err => alert('Forecast error: ' + err.message));
}

//weather using geolocation
function getLocationWeather() {
  if (!navigator.geolocation) return alert('Geolocation not supported');
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        displayWeather(data);
        getForecast(data.name);
      })
      .catch(err => alert('Location error: ' + err.message));
  });
}

searchBtn.addEventListener('click', () => getWeather(cityInput.value.trim()));
locationBtn.addEventListener('click', getLocationWeather);

updateRecentSearches();
