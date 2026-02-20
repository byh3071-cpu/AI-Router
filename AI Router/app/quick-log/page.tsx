"use client";

import React, { useState } from "react";

const STAGES = [
  { value: "planning", label: "Planning" },
  { value: "dev", label: "Dev" },
  { value: "experiment", label: "Experiment" },
  { value: "deploy", label: "Deploy" },
] as const;

export default function QuickLogPage() {
  const [project, setProject] = useState("");
  const [stage, setStage] = useState<"planning" | "dev" | "experiment" | "deploy">("dev");
  const [summary, setSummary] = useState("");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [leverageScore, setLeverageScore] = useState(3);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          stage,
          summary,
          energy_level: energyLevel,
          leverage_score: leverageScore,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save log" });
        return;
      }

      setMessage({ type: "success", text: "Log saved." });
      setSummary("");
    } catch {
      setMessage({ type: "error", text: "Request failed." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-6">Quick Log</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="project" className="block text-sm font-medium mb-1">
            Project
          </label>
          <input
            id="project"
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="stage" className="block text-sm font-medium mb-1">
            Stage
          </label>
          <select
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value as typeof stage)}
            className="w-full border rounded px-3 py-2"
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium mb-1">
            Summary
          </label>
          <input
            id="summary"
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="energy_level" className="block text-sm font-medium mb-1">
              Energy (1–5)
            </label>
            <input
              id="energy_level"
              type="number"
              min={1}
              max={5}
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="leverage_score" className="block text-sm font-medium mb-1">
              Leverage (1–5)
            </label>
            <input
              id="leverage_score"
              type="number"
              min={1}
              max={5}
              value={leverageScore}
              onChange={(e) => setLeverageScore(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {message && (
          <p
            className={
              message.type === "success"
                ? "text-green-600 text-sm"
                : "text-red-600 text-sm"
            }
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white rounded px-3 py-2 font-medium disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save log"}
        </button>
      </form>
    </div>
  );
}
