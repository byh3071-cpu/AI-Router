"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Project = {
  id: string;
  title: string | null;
  status: string | null;
  progress: number | null;
  laptop_path: string | null;
  desktop_path: string | null;
  doc_url: string | null;
};

export default function HubPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [launching, setLaunching] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, title, status, progress, laptop_path, desktop_path, doc_url")
          .order("title");
        if (error) {
          console.error("Hub getProjects:", error);
          setProjects([]);
        } else {
          setProjects(data ?? []);
        }
      } catch (e) {
        console.error("Hub getProjects:", e);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLaunchCursor(project: Project) {
    const deviceType = process.env.NEXT_PUBLIC_DEVICE_TYPE ?? "desktop";
    const path =
      deviceType === "laptop"
        ? project.laptop_path ?? project.desktop_path
        : project.desktop_path ?? project.laptop_path;
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

  async function handleCopyNotionUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("복사에 실패했습니다. URL을 수동으로 복사해 주세요.");
    }
  }

  const configMissing = !supabase;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <h1 className="text-2xl font-semibold mb-6">Project Hub</h1>

      {configMissing ? (
        <p className="text-amber-400/90">
          <strong>환경 변수 미설정.</strong>{" "}
          <code className="text-zinc-300">ai-builder-os/.env.local</code>에
          NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 를 추가한 뒤
          서버를 재시작하세요.
        </p>
      ) : loading ? (
        <p className="text-zinc-400">로딩 중…</p>
      ) : projects.length === 0 ? (
        <p className="text-zinc-400">
          프로젝트가 없습니다. Supabase{" "}
          <code className="text-zinc-300">projects</code> 테이블에 행을
          추가하세요.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setCopied(false);
                setSelectedProject(p);
              }}
              className="block w-full text-left rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-colors p-4"
            >
              <h2 className="font-medium truncate">{p.title ?? "Untitled"}</h2>
              <p className="text-sm text-zinc-400 mt-1">{p.status}</p>
              <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, p.progress ?? 0)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setCopied(false);
            setSelectedProject(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Project detail"
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-zinc-100">
                {selectedProject.title ?? "Untitled"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setCopied(false);
                  setSelectedProject(null);
                }}
                className="text-zinc-400 hover:text-zinc-100 shrink-0"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              {selectedProject.status}
            </p>

            {selectedProject.doc_url &&
            selectedProject.doc_url.startsWith("http") ? (
              <div className="mb-3">
                <input
                  value={selectedProject.doc_url}
                  readOnly
                  className="w-full mb-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300"
                />
                <button
                  type="button"
                  onClick={() => handleCopyNotionUrl(selectedProject.doc_url!)}
                  className="w-full text-center py-2.5 px-4 rounded-md border border-zinc-600 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-500 transition-colors"
                >
                  {copied ? "Notion URL Copied" : "Copy Notion URL"}
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => handleLaunchCursor(selectedProject)}
              disabled={
                !(
                  selectedProject.laptop_path ?? selectedProject.desktop_path
                ) || launching
              }
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-medium text-sm text-white"
            >
              {launching ? "Launching…" : "Launch Cursor"}
            </button>

            <p className="mt-4 text-xs text-zinc-500">
              팝업 이슈를 피하기 위해 Notion은 URL 복사 방식으로 열어 주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
