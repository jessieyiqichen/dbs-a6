/** Weather for the /day page, from Open-Meteo (free, no key). The page shows it; the harness does not plan on it.
 *  The place is the campus in the made-up calendar, not anyone's home. */

export const WEATHER_PLACE = { name: "Hyde Park, Chicago", latitude: 41.79, longitude: -87.6, timezone: "America/Chicago" };
export const FORECAST_DAYS = 7;
/** Last week too, so the week strip can show a past day. */
export const PAST_DAYS = 7;
export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${WEATHER_PLACE.latitude}&longitude=${WEATHER_PLACE.longitude}` +
  "&current=temperature_2m,weather_code" +
  "&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max" +
  `&temperature_unit=fahrenheit&timezone=${encodeURIComponent(WEATHER_PLACE.timezone)}&forecast_days=${FORECAST_DAYS}&past_days=${PAST_DAYS}`;

export type Weather = {
  date: string;
  high: number;
  low: number;
  label: string;
  rainChance: number;
  current: { temp: number; label: string } | null;
};

/** WMO weather interpretation codes, grouped into the few words the page has room for. */
const LABELS: Array<[number, number, string]> = [
  [0, 0, "Clear"],
  [1, 1, "Mostly clear"],
  [2, 2, "Partly cloudy"],
  [3, 3, "Overcast"],
  [45, 48, "Fog"],
  [51, 57, "Drizzle"],
  [61, 67, "Rain"],
  [71, 77, "Snow"],
  [80, 82, "Showers"],
  [85, 86, "Snow showers"],
  [95, 99, "Thunderstorm"],
];

export function weatherLabel(code: number): string {
  return LABELS.find(([lo, hi]) => code >= lo && code <= hi)?.[2] ?? "Unknown";
}

type Daily = { time: string[]; max: number[]; min: number[]; code: number[]; rain: number[] };

function numbers(value: unknown, length: number): number[] | null {
  return Array.isArray(value) && value.length === length && value.every((v) => typeof v === "number") ? value : null;
}

function readDaily(raw: unknown): Daily | null {
  const d = (raw as { daily?: Record<string, unknown> } | null)?.daily;
  if (!d || !Array.isArray(d.time) || !d.time.every((t) => typeof t === "string")) return null;
  const n = d.time.length;
  const max = numbers(d.temperature_2m_max, n);
  const min = numbers(d.temperature_2m_min, n);
  const code = numbers(d.weather_code, n);
  const rain = numbers(d.precipitation_probability_max, n);
  return max && min && code && rain ? { time: d.time as string[], max, min, code, rain } : null;
}

function readCurrent(raw: unknown, date: string): Weather["current"] {
  const c = (raw as { current?: Record<string, unknown> } | null)?.current;
  if (!c || typeof c.time !== "string" || !c.time.startsWith(date)) return null;
  if (typeof c.temperature_2m !== "number" || typeof c.weather_code !== "number") return null;
  return { temp: Math.round(c.temperature_2m), label: weatherLabel(c.weather_code) };
}

/** The forecast for one day out of an Open-Meteo response, or null when the response has no usable row for it. */
export function parseForecast(raw: unknown, date: string): Weather | null {
  const daily = readDaily(raw);
  if (!daily) return null;
  const i = daily.time.indexOf(date);
  if (i < 0) return null;
  return {
    date,
    high: Math.round(daily.max[i]),
    low: Math.round(daily.min[i]),
    label: weatherLabel(daily.code[i]),
    rainChance: Math.round(daily.rain[i]),
    current: readCurrent(raw, date),
  };
}
