import { NextResponse } from "next/server";

type WeatherCacheEntry = {
  data: {
    city: string;
    tempF: number;
    conditions: string;
    fetchedAt: string;
    source: "onecall" | "weather";
  };
  timestamp: number;
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, WeatherCacheEntry>();
const CACHE_HEADERS = { "Cache-Control": "public, max-age=21600" };

const BOSTON_LAT = 42.3601;
const BOSTON_LON = -71.0589;

async function fetchOneCall(apiKey: string) {
  const url = new URL("https://api.openweathermap.org/data/3.0/onecall");
  url.searchParams.set("lat", BOSTON_LAT.toString());
  url.searchParams.set("lon", BOSTON_LON.toString());
  url.searchParams.set("exclude", "minutely,hourly,daily,alerts");
  url.searchParams.set("units", "imperial");
  url.searchParams.set("appid", apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: 21600 },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`onecall_${response.status}:${body}`);
  }

  const payload = await response.json();
  return {
    tempF: Math.round(payload?.current?.temp ?? 0),
    conditions:
      payload?.current?.weather?.[0]?.main ||
      payload?.current?.weather?.[0]?.description ||
      "",
  };
}

// Fallback for keys/plans that do not include One Call 3.0.
async function fetchCurrentWeather(apiKey: string) {
  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("lat", BOSTON_LAT.toString());
  url.searchParams.set("lon", BOSTON_LON.toString());
  url.searchParams.set("units", "imperial");
  url.searchParams.set("appid", apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: 21600 },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`weather_${response.status}:${body}`);
  }

  const payload = await response.json();
  return {
    tempF: Math.round(payload?.main?.temp ?? 0),
    conditions:
      payload?.weather?.[0]?.main || payload?.weather?.[0]?.description || "",
  };
}

export async function GET() {
  const cached = cache.get("boston");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ ok: true, data: cached.data }, { headers: CACHE_HEADERS });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "missing_api_key",
          message: "OpenWeather API key is not configured.",
        },
      },
      { headers: CACHE_HEADERS }
    );
  }

  try {
    let tempF = 0;
    let conditions = "";
    let source: "onecall" | "weather" = "onecall";

    try {
      const current = await fetchOneCall(apiKey);
      tempF = current.tempF;
      conditions = current.conditions;
    } catch (oneCallError) {
      const current = await fetchCurrentWeather(apiKey);
      tempF = current.tempF;
      conditions = current.conditions;
      source = "weather";
      console.warn("[weather] One Call failed, used /data/2.5/weather instead.");
      console.warn(oneCallError);
    }

    const data = {
      city: "Boston",
      tempF,
      conditions,
      fetchedAt: new Date().toISOString(),
      source,
    };

    cache.set("boston", { data, timestamp: Date.now() });

    return NextResponse.json({ ok: true, data }, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "fetch_failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { headers: CACHE_HEADERS }
    );
  }
}
