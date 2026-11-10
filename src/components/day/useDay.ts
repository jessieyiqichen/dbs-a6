"use client";

import { useEffect, useState } from "react";
import type { WeatherPayload } from "@/app/api/weather/route";
import type { DayPayload } from "./types";

/** How often the page asks the API whether a new plan was saved. Short enough that a save shows during a demo. */
export const POLL_MS = 3000;
/** Weather changes slowly and the route caches it anyway; ask rarely. */
const WEATHER_POLL_MS = 10 * 60 * 1000;

type DayState = { data: DayPayload | null; error: string | null };

/** Polls /api/day. `selected` null means "the plan nearest today"; a date means that day exactly. */
export function useDay(selected: string | null): DayState {
  const [state, setState] = useState<DayState>({ data: null, error: null });
  useEffect(() => {
    let alive = true;
    const url = selected ? `/api/day?date=${selected}` : "/api/day";
    async function poll() {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as DayPayload;
        if (alive) setState({ data, error: null });
      } catch (e) {
        if (alive) setState((s) => ({ ...s, error: e instanceof Error ? e.message : "fetch failed" }));
      }
    }
    void poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [selected]);
  return state;
}

/** Polls /api/weather for one day. Missing weather is not an error the page shows loudly. */
export function useWeather(date: string | undefined): WeatherPayload | null {
  const [payload, setPayload] = useState<WeatherPayload | null>(null);
  useEffect(() => {
    if (!date) return;
    let alive = true;
    async function poll() {
      try {
        const res = await fetch(`/api/weather?date=${date}`, { cache: "no-store" });
        const next = (await res.json()) as WeatherPayload;
        if (alive) setPayload(next);
      } catch (e) {
        if (alive) setPayload({ weather: null, error: e instanceof Error ? e.message : "fetch failed" });
      }
    }
    void poll();
    const id = setInterval(poll, WEATHER_POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [date]);
  return payload;
}
