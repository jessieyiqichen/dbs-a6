import type { WeatherPayload } from "@/app/api/weather/route";
import { WEATHER_PLACE } from "@/lib/weather";

/** One line of weather for the day shown. Quiet when it cannot be fetched: the plan does not depend on it. */
export function Weather({ payload }: { payload: WeatherPayload | null }) {
  if (!payload) return <p className="text-sm text-muted">Weather…</p>;
  const w = payload.weather;
  if (!w) return <p className="text-sm text-muted">Weather unavailable</p>;
  const now = w.current ? `${w.current.temp}° now, ${w.current.label.toLowerCase()}` : w.label;
  return (
    <p className="text-sm text-ink" title={`Open-Meteo, ${WEATHER_PLACE.name}`}>
      <span className="font-semibold">{now}</span>
      <span className="text-muted">
        {" · "}high {w.high}° / low {w.low}°{w.rainChance >= 30 ? ` · ${w.rainChance}% rain` : ""}
      </span>
    </p>
  );
}
