const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeatherData(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    past_days: "1",
    forecast_days: "2",
    timezone: "Asia/Makassar",
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`API merespons status ${response.status}`);
  }

  const data = await response.json();

  if (!data.current || !data.hourly) {
    throw new Error("Format data cuaca tidak sesuai");
  }

  return data;
}
