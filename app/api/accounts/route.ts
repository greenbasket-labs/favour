import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Public registration is disabled. Contact Favour Int'l School." },
    { status: 410 }
  );
}
