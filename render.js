import {
  getWeatherDescription,
  findCurrentHourIndex,
  buildHourlyChartData,
} from "./weather-logic.js";
import { weatherCodes } from "./weatherCodes.js";

let hourlyChart = null;

export function showLoading() {
  const content = document.getElementById("weather-content");
  content.className = "loading";
  content.innerText = "Memuat data cuaca...";
}

export function showError(message) {
  const content = document.getElementById("weather-content");
  content.className = "";
  content.innerText = message;
}

export function renderWeather(data) {
  const current = data.current;
  const hourly = data.hourly;

  const startIndex = findCurrentHourIndex(hourly.time);
  const { labels, temps, pop } = buildHourlyChartData(hourly, startIndex, 24);
  const weatherDesc = getWeatherDescription(current.weather_code, weatherCodes);

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
      <div class="chart-wrapper">
        <canvas id="hourlyChart"></canvas>
      </div>
    </div>
  `;

  const content = document.getElementById("weather-content");
  content.className = "";
  content.innerHTML = html;

  renderHourlyChart(labels, temps, pop);
}

function renderHourlyChart(labels, temps, pop) {
  const canvas = document.getElementById("hourlyChart");
  if (!canvas) return;

  if (hourlyChart) {
    hourlyChart.destroy();
  }

  // `Chart` global disediakan oleh <script> CDN Chart.js di index.html
  hourlyChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Suhu (°C)",
          data: temps,
          borderColor: "#2e7d32",
          backgroundColor: "rgba(46, 125, 50, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
          fill: true,
          yAxisID: "y",
        },
        {
          label: "Peluang Hujan (%)",
          data: pop,
          borderColor: "#0288d1",
          backgroundColor: "rgba(2, 136, 209, 0.15)",
          borderWidth: 2,
          borderDash: [4, 4],
          tension: 0.3,
          pointRadius: 0,
          fill: true,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: { boxWidth: 12, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ctx.dataset.yAxisID === "y"
                ? `Suhu: ${ctx.formattedValue}°C`
                : `Peluang Hujan: ${ctx.formattedValue}%`,
          },
        },
      },
      scales: {
        x: {
          ticks: { maxTicksLimit: 8, font: { size: 10 } },
          grid: { display: false },
        },
        y: {
          position: "left",
          title: { display: true, text: "°C", font: { size: 10 } },
          grid: { color: "#f0f0f0" },
        },
        y1: {
          position: "right",
          min: 0,
          max: 100,
          title: { display: true, text: "%", font: { size: 10 } },
          grid: { display: false },
        },
      },
    },
  });
}
