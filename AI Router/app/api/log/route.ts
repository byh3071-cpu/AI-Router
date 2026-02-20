import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const STAGES = ["planning", "dev", "experiment", "deploy"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const project = typeof body.project === "string" ? body.project.trim() : "";
    const stage =
      typeof body.stage === "string" && STAGES.includes(body.stage as (typeof STAGES)[number])
        ? (body.stage as (typeof STAGES)[number])
        : null;
    const summary = typeof body.summary === "string" ? body.summary.trim() : "";
    const energyLevel = body.energy_level;
    const leverageScore = body.leverage_score;

    if (!project) {
      return NextResponse.json(
        { error: "project is required" },
        { status: 400 }
      );
    }
    if (!stage) {
      return NextResponse.json(
        { error: "stage must be one of: planning, dev, experiment, deploy" },
        { status: 400 }
      );
    }
    if (!summary) {
      return NextResponse.json(
        { error: "summary is required" },
        { status: 400 }
      );
    }

    const energy =
      typeof energyLevel === "number" &&
      energyLevel >= 1 &&
      energyLevel <= 5
        ? energyLevel
        : null;
    const leverage =
      typeof leverageScore === "number" &&
      leverageScore >= 1 &&
      leverageScore <= 5
        ? leverageScore
        : null;

    const { error } = await supabase.from("build_logs").insert({
      project,
      stage,
      summary,
      energy_level: energy,
      leverage_score: leverage,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
