import { NextRequest, NextResponse } from "next/server";
import { Ohgnoy_BackendAPI } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const response = await fetch(`${Ohgnoy_BackendAPI}/users/${params.userId}/likedMons`, {
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
