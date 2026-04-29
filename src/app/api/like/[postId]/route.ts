import { NextRequest, NextResponse } from "next/server";
import { Ohgnoy_BackendAPI } from "@/lib/constants";

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const { postId } = params;
  const body = await req.json();
  const response = await fetch(`${Ohgnoy_BackendAPI}/like/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
  const { postId } = params;
  const body = await req.json();
  const response = await fetch(`${Ohgnoy_BackendAPI}/like/${postId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
  const { postId } = params;
  const response = await fetch(`${Ohgnoy_BackendAPI}/like/${postId}`, {
    method: "GET",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
