export function searchLocalCity(query, cities) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return cities.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
}

/**
 * Terjemahkan kode cuaca WMO ke teks Bahasa Indonesia, dengan fallback.
 */
export function getWeatherDescription(code, weatherCodes) {
  return weatherCodes[code] || "Cuaca Tidak Diketahui";
}

/**
 * Ambil kota terpilih dari daftar hasil search berdasarkan index.
 * Mengembalikan null kalau index tidak valid (bukan crash) —
 * ini pengganti akses `results[index]` langsung yang dulu rawan error.
 */
export function resolveCitySelection(index, results) {
  if (!Array.isArray(results)) return null;
  const r = results[index];
  if (!r) return null;
  return { name: r.name, lat: r.lat, lon: r.lon };
}

/**
 * Cari index jam saat ini di dalam array waktu hourly forecast.
 * Fallback ke 24 kalau tidak ketemu (perilaku sama seperti kode asli).
 */
export function findCurrentHourIndex(hourlyTimes, now = new Date()) {
  const currentHourIso = now.toISOString().slice(0, 13);
  const index = hourlyTimes.findIndex((t) => t.startsWith(currentHourIso));
  return index === -1 ? 24 : index;
}

/**
 * Bangun data chart (labels, temps, pop) dari response hourly Open-Meteo,
 * mulai dari startIndex sepanjang hoursCount jam.
 */
export function buildHourlyChartData(hourly, startIndex, hoursCount = 24) {
  const labels = [];
  const temps = [];
  const pop = [];

  const end = Math.min(startIndex + hoursCount, hourly.time.length);
  for (let i = startIndex; i < end; i++) {
    labels.push(
      new Date(hourly.time[i]).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    temps.push(Math.round(hourly.temperature_2m[i] * 10) / 10);
    pop.push(hourly.precipitation_probability[i] || 0);
  }

  return { labels, temps, pop };
}
