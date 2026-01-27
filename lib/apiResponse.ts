import { NextResponse } from "next/server";

export type ApiErrorCode = "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_ERROR";

const generatedAt = () => new Date().toISOString();

export function okList<T>(data: T[]) {
  return NextResponse.json(
    {
      ok: true,
      data,
      meta: { count: data.length, generatedAt: generatedAt() },
    },
    { status: 200 }
  );
}

export function okItem<T>(data: T) {
  return NextResponse.json(
    {
      ok: true,
      data,
      meta: { generatedAt: generatedAt() },
    },
    { status: 200 }
  );
}

export function err(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message },
      meta: { generatedAt: generatedAt() },
    },
    { status }
  );
}

export function applyCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
