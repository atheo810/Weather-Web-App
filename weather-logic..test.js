import { describe, it, expect } from "vitest";
import {
  searchLocalCity,
  getWeatherDescription,
  resolveCitySelection,
  findCurrentHourIndex,
  buildHourlyChartData,
} from "./weather-logic.js";

const mockCities = [
  { name: "Banjarbaru", admin1: "Kalimantan Selatan", lat: -3.44, lon: 114.83 },
  { name: "Banjarmasin", admin1: "Kalimantan Selatan", lat: -3.32, lon: 114.59 },
  { name: "Jakarta", admin1: "DKI Jakarta", lat: -6.21, lon: 106.85 },
];

describe("searchLocalCity", () => {
  it("mengembalikan kota yang cocok dengan query, case-insensitive", () => {
    const result = searchLocalCity("banjar", mockCities);
    expect(result.map((c) => c.name)).toEqual(["Banjarbaru", "Banjarmasin"]);
  });

  it("mengembalikan array kosong kalau query kosong atau spasi saja", () => {
    expect(searchLocalCity("", mockCities)).toEqual([]);
    expect(searchLocalCity("   ", mockCities)).toEqual([]);
  });

  it("mengembalikan array kosong kalau tidak ada kota yang cocok", () => {
    expect(searchLocalCity("xyzxyz", mockCities)).toEqual([]);
  });

  it("membatasi hasil maksimal 8 kota", () => {
    const manyCities = Array.from({ length: 20 }, (_, i) => ({
      name: `Kota${i}`,
      lat: 0,
      lon: 0,
    }));
    expect(searchLocalCity("kota", manyCities)).toHaveLength(8);
  });
});

describe("getWeatherDescription", () => {
  const weatherCodes = { 0: "Cerah", 61: "Hujan Ringan" };

  it("mengembalikan deskripsi yang sesuai untuk kode yang dikenal", () => {
    expect(getWeatherDescription(0, weatherCodes)).toBe("Cerah");
    expect(getWeatherDescription(61, weatherCodes)).toBe("Hujan Ringan");
  });

  it("mengembalikan fallback untuk kode yang tidak dikenal", () => {
    expect(getWeatherDescription(999, weatherCodes)).toBe(
      "Cuaca Tidak Diketahui",
    );
  });
});

describe("resolveCitySelection", () => {
  const results = [
    { name: "Banjarbaru", lat: -3.44, lon: 114.83 },
    { name: "Jakarta", lat: -6.21, lon: 106.85 },
  ];

  it("mengembalikan objek kota untuk index yang valid", () => {
    expect(resolveCitySelection(1, results)).toEqual({
      name: "Jakarta",
      lat: -6.21,
      lon: 106.85,
    });
  });

  it("mengembalikan null untuk index di luar jangkauan (bug lama: crash)", () => {
    expect(resolveCitySelection(5, results)).toBeNull();
    expect(resolveCitySelection(-1, results)).toBeNull();
  });

  it("mengembalikan null kalau results bukan array", () => {
    expect(resolveCitySelection(0, null)).toBeNull();
    expect(resolveCitySelection(0, undefined)).toBeNull();
  });
});

describe("findCurrentHourIndex", () => {
  it("menemukan index jam yang cocok dengan waktu sekarang", () => {
    const now = new Date("2026-09-19T14:30:00Z");
    const hourlyTimes = [
      "2026-09-19T13:00",
      "2026-09-19T14:00",
      "2026-09-19T15:00",
    ];
    expect(findCurrentHourIndex(hourlyTimes, now)).toBe(1);
  });

  it("fallback ke index 24 kalau jam sekarang tidak ada di data", () => {
    const now = new Date("2026-09-19T14:30:00Z");
    const hourlyTimes = ["2020-01-01T00:00"];
    expect(findCurrentHourIndex(hourlyTimes, now)).toBe(24);
  });
});

describe("buildHourlyChartData", () => {
  const hourly = {
    time: ["2026-09-19T14:00", "2026-09-19T15:00", "2026-09-19T16:00"],
    temperature_2m: [28.14, 27.6, 26.9],
    precipitation_probability: [10, null, 40],
  };

  it("membangun labels, temps, dan pop mulai dari startIndex", () => {
    const result = buildHourlyChartData(hourly, 0, 2);
    expect(result.labels).toHaveLength(2);
    expect(result.temps).toEqual([28.1, 27.6]);
  });

  it("mengganti null precipitation_probability jadi 0", () => {
    const result = buildHourlyChartData(hourly, 0, 2);
    expect(result.pop).toEqual([10, 0]);
  });

  it("tidak error kalau hoursCount melebihi data yang tersedia", () => {
    const result = buildHourlyChartData(hourly, 0, 24);
    expect(result.temps).toHaveLength(3);
  });
});