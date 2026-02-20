"use client";

import Link from "next/link";
import { useState } from "react";

type Project = {
  id: string;
  title: string | null;
  status: string | null;
  progress: number | null;
  laptop_path: string | null;
  desktop_path: string | null;
  doc_url: string | null;
};

export default function HubDetail({ project }: { project: Project }) {
  const [launching, setLaunching] = useState(false);
  const deviceType = process.env.NEXT_PUBLIC_DEVICE_TYPE ?? "desktop";
  const path =
    deviceType === "laptop"
      ? project.laptop_path ?? project.desktop_path
      : project.desktop_path ?? project.laptop_path;

  async function handleLaunch() {
    if (!path) return;
    setLaunching(true);
    try {
      const res = await fetch("/api/launch-cursor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to launch");
      }
    } catch {
      alert("Request failed");
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/hub" className="text-zinc-400 hover:text-zinc-100">
            ← Hub
          </Link>
          <h1 className="text-xl font-semibold">
            {project.title ?? "Untitled"}
          </h1>
          <span className="text-sm text-zinc-500 capitalize">
            {project.status}
          </span>
        </div>
        <button
          onClick={handleLaunch}
          disabled={!path || launching}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-medium text-sm"
        >
          {launching ? "Launching…" : "Launch Cursor"}
        </button>
      </header>
      <main className="flex-1 min-h-0 p-6 flex flex-col">
        {project.doc_url && project.doc_url.startsWith("http") ? (
          <iframe
            src={project.doc_url}
            className="w-full flex-1 min-h-[400px] rounded-lg border border-zinc-800 bg-white"
            title="Notion doc"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        ) : (
          <div className="w-full flex-1 min-h-[400px] rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500">
            {project.doc_url ? "유효한 doc URL을 입력하세요 (http로 시작)" : "No doc URL"}
          </div>
        )}
      </main>
    </div>
  );
}
