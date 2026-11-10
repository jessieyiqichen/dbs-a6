import { describe, expect, it } from "vitest";
import { parseForecast, weatherLabel } from "./weather";

const sample = {
  current: { time: "2026-11-10T12:15", temperature_2m: 41.3, weather_code: 61 },
  daily: {
    time: ["2026-11-10", "2026-11-11"],
    temperature_2m_max: [46.1, 50.4],
    temperature_2m_min: [35.2, 38.0],
    weather_code: [61, 2],
    precipitation_probability_max: [80, 10],
  },
};

describe("weatherLabel", () => {
  it("maps WMO codes to short words", () => {
    expect(weatherLabel(0)).toBe("Clear");
    expect(weatherLabel(2)).toBe("Partly cloudy");
    expect(weatherLabel(61)).toBe("Rain");
    expect(weatherLabel(73)).toBe("Snow");
    expect(weatherLabel(95)).toBe("Thunderstorm");
  });
  it("falls back for unknown codes", () => {
    expect(weatherLabel(999)).toBe("Unknown");
  });
});

describe("parseForecast", () => {
  it("picks the day and rounds the numbers", () => {
    const w = parseForecast(sample, "2026-11-11");
    expect(w).toEqual({ date: "2026-11-11", high: 50, low: 38, label: "Partly cloudy", rainChance: 10, current: null });
  });
  it("adds the current reading only for the current day", () => {
    const w = parseForecast(sample, "2026-11-10");
    expect(w?.current).toEqual({ temp: 41, label: "Rain" });
  });
  it("returns null for a day outside the forecast", () => {
    expect(parseForecast(sample, "2026-12-01")).toBeNull();
  });
  it("returns null for a malformed response", () => {
    expect(parseForecast({ daily: { time: "nope" } }, "2026-11-10")).toBeNull();
    expect(parseForecast(null, "2026-11-10")).toBeNull();
    expect(parseForecast({ daily: { ...sample.daily, weather_code: [61] } }, "2026-11-11")).toBeNull();
  });
});
