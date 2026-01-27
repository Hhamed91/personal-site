"use client";

import { useEffect, useMemo, useState } from "react";

type WeatherResponse =
  | {
      ok: true;
      data: {
        city: string;
        tempF: number;
        conditions: string;
        fetchedAt: string;
      };
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

const WEATHER_REFRESH_MS = 6 * 60 * 60 * 1000;
const TIME_REFRESH_MS = 60 * 1000;

export default function BostonStatus() {
  const [time, setTime] = useState("--:--");
  const [tempF, setTempF] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    []
  );

  useEffect(() => {
    const updateTime = () => {
      setTime(timeFormatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, TIME_REFRESH_MS);
    return () => clearInterval(interval);
  }, [timeFormatter]);

  useEffect(() => {
    let isMounted = true;

    const loadWeather = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch("/api/weather/boston");
        const data = (await response.json()) as WeatherResponse;

        if (response.ok && data.ok && isMounted) {
          setTempF(data.data.tempF);
          setIsLoading(false);
          return;
        }

        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadWeather();
    const interval = setInterval(loadWeather, WEATHER_REFRESH_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const timeDisplay = isLoading ? "--:--" : time;
  const tempDisplay = isLoading
    ? "--°F"
    : hasError || tempF === null
      ? "—°F"
      : `${tempF}°F`;

  return (
    <div className="flex min-w-[160px] items-center gap-2 whitespace-nowrap text-sm text-slate-600">
      <span className="font-semibold text-slate-900">Boston</span>
      <span className="truncate">· {timeDisplay} · {tempDisplay}</span>
    </div>
  );
}
