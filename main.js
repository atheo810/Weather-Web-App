import { indonesiaCities } from "./cities-data.js";
import { fetchWeatherData } from "./api.js";
import { renderWeather, showLoading, showError } from "./render.js";
import { initSearchUI } from "./search-ui.js";

let currentCity = {
  name: "Banjarbaru",
  lat: -3.4404,
  lon: 114.8322,
};

async function loadWeather() {
  if (
    typeof currentCity.lat !== "number" ||
    typeof currentCity.lon !== "number"
  ) {
    showError("Koordinat kota tidak valid. Coba pilih kota lain.");
    console.error("currentCity tidak valid:", currentCity);
    return;
  }

  showLoading();

  try {
    const data = await fetchWeatherData(currentCity.lat, currentCity.lon);
    renderWeather(data);
  } catch (error) {
    showError("Gagal memuat data cuaca. Periksa koneksi internet Anda.");
    console.error("loadWeather error:", error);
  }
}

function handleCitySelected(city) {
  currentCity = city;
  document.getElementById("city-title").innerText = `📍 ${currentCity.name}`;
  loadWeather();
}

initSearchUI({ cities: indonesiaCities, onCitySelected: handleCitySelected });

document.getElementById("refresh-btn").addEventListener("click", loadWeather);

loadWeather();
