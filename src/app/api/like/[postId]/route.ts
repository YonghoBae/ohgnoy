import { NextRequest, NextResponse } from "next/server";
import { Ohgnoy_BackendAPI } from "@/lib/constants";

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const body = await req.json();
  const response = await fetch(`${Ohgnoy_BackendAPI}/posts/${postId}/likes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
