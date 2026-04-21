import { NextRequest, NextResponse } from "next/server";
import { Ohgnoy_BackendAPI } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const response = await fetch(`${Ohgnoy_BackendAPI}/users/${userId}/likedMons`, {
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
