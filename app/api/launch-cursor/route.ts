import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const path = typeof body?.path === "string" ? body.path.trim() : "";
    if (!path) {
      return NextResponse.json({ error: "path required" }, { status: 400 });
    }

    const safePath = path.includes(" ")
      ? `"${path.replace(/"/g, '\\"')}"`
      : path;
    exec(`cursor ${safePath}`, (err) => {
      if (err) console.error("launch-cursor:", err);
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Launch failed" }, { status: 500 });
  }
}
