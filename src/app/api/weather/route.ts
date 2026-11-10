import { NextResponse } from "next/server";
import { parseForecast, WEATHER_URL, type Weather } from "@/lib/weather";

/** Weather for one day, for the /day page. The only outside call the page makes; cached in memory so a page polling
 *  every 3 s asks Open-Meteo at most once every ten minutes. Never fails the page: on any error `weather` is null. */
export const dynamic = "force-dynamic";

const CACHE_MS = 10 * 60 * 1000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
let cache: { at: number; raw: unknown } | null = null;

export type WeatherPayload = { weather: Weather | null; error: string | null };

async function forecast(): Promise<unknown> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.raw;
  const res = await fetch(WEATHER_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Open-Meteo answered ${res.status}`);
  const raw: unknown = await res.json();
  cache = { at: Date.now(), raw };
  return raw;
}

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!ISO_DATE.test(date)) return NextResponse.json({ weather: null, error: "date must be YYYY-MM-DD" }, { status: 400 });
  try {
    const weather = parseForecast(await forecast(), date);
    const payload: WeatherPayload = { weather, error: weather ? null : "no forecast for that day" };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("weather could not be fetched", { url: WEATHER_URL, error });
    const payload: WeatherPayload = { weather: null, error: "weather unavailable" };
    return NextResponse.json(payload);
  }
}
