let currentCity = {
  name: "Banjarbaru",
  lat: -3.4404,
  lon: 114.8322,
};

const weatherCodes = {
  0: "Cerah",
  1: "Cerah Berawan",
  2: "Berawan",
  3: "Mendung",
  45: "Berkabut",
  48: "Embun Berbunyi",
  51: "Gerimis Ringan",
  53: "Gerimis Sedang",
  55: "Gerimis Lebat",
  61: "Hujan Ringan",
  63: "Hujan Sedang",
  65: "Hujan Lebat",
  80: "Hujan Lokal Ringan",
  81: "Hujan Lokal Sedang",
  82: "Hujan Lokal Lebat",
  95: "Badai Petir",
  96: "Badai Petir & Hujan Es",
};

async function fetchWeather() {
  const content = document.getElementById("weather-content");
  content.className = "loading";
  content.innerText = "Memuat data cuaca...";

  // Mengambil data cuaca saat ini + prakiraan per jam (termasuk 24 jam ke depan & belakang)
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${currentCity.lat}&longitude=${currentCity.lon}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&past_days=1&forecast_days=2&timezone=Asia%2FMakassar`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    renderWeather(data);
  } catch (error) {
    content.innerText =
      "Gagal memuat data cuaca. Periksa koneksi internet Anda.";
    console.error(error);
  }
}

function renderWeather(data) {
  const current = data.current;
  const hourly = data.hourly;

  const now = new Date();
  const currentHourIso = now.toISOString().slice(0, 13);
  let startIndex = hourly.time.findIndex((t) => t.startsWith(currentHourIso));
  if (startIndex === -1) startIndex = 24;

  let hourlyHtml = "";
  for (let i = startIndex; i < startIndex + 24 && i < hourly.time.length; i++) {
    const timeStr = new Date(hourly.time[i]).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const temp = Math.round(hourly.temperature_2m[i]);
    const pop = hourly.precipitation_probability[i] || 0;

    hourlyHtml += `
          <div class="hourly-item">
            <div class="time">${timeStr}</div>
            <div class="temp-sm">${temp}°C</div>
            <div style="font-size: 0.75rem; color: #0288d1; margin-top: 2px;">🌧️ ${pop}%</div>
          </div>
        `;
  }

  const weatherDesc =
    weatherCodes[current.weather_code] || "Cuaca Tidak Diketahui";

  const html = `
        <div class="current-weather">
          <div class="temp">${Math.round(current.temperature_2m)}°C</div>
          <div class="condition">${weatherDesc}</div>
          <div class="details">
            <div>💨 Kecepatan Angin<br><strong>${current.wind_speed_10m} km/h</strong></div>
            <div>🌧️ Peluang Hujan<br><strong>${current.precipitation_probability ?? 0}%</strong></div>
            <div>💧 Kelembapan<br><strong>${current.relative_humidity_2m}%</strong></div>
          </div>
        </div>

        <div class="hourly-container">
          <h2>Prakiraan 24 Jam Ke Depan</h2>
          <div class="hourly-scroll">
            ${hourlyHtml}
          </div>
        </div>
      `;

  const content = document.getElementById("weather-content");
  content.className = "";
  content.innerHTML = html;
}

function searchLocalCity(query) {
  const q = query.toLowerCase();
  return indonesiaCities
    .filter((c) => c.name.toLowerCase().includes(q))
    .slice(0, 8);
}

function handleSearch() {
  const query = document.getElementById("city-input").value.trim();
  if (!query) return;

  const resultsBox = document.getElementById("search-results");
  const results = searchLocalCity(query);

  if (results.length === 0) {
    resultsBox.innerHTML =
      "<div class='search-result-item'>Kota tidak ditemukan</div>";
    return;
  }

  resultsBox.innerHTML = results
    .map(
      (r, i) => `
      <div class="search-result-item" onclick="selectCity(${i})">
        ${r.name}${r.admin1 ? ", " + r.admin1 : ""}
      </div>
    `,
    )
    .join("");

  window.__searchResults = results;
}

function selectCity(index) {
  const r = window.__searchResults[index];
  currentCity = { name: r.name, lat: r.lat, lon: r.lon };

  document.getElementById("search-results").innerHTML = "";
  document.getElementById("city-input").value = "";
  document.getElementById("city-title").innerText = `📍 ${currentCity.name}`;

  fetchWeather();
}

fetchWeather();
