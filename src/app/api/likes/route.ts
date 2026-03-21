import { NextRequest, NextResponse } from "next/server";
import { Ohgnoy_BackendAPI } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const response = await fetch(`${Ohgnoy_BackendAPI}/likes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const response = await fetch(`${Ohgnoy_BackendAPI}/likes`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
