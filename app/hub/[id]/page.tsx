import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import HubDetail from "./HubDetail";

async function getProject(id: string) {
  if (!supabase || !id) return null;
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, status, progress, laptop_path, desktop_path, doc_url")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data;
}

export default async function HubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let id: string;
  try {
    const p = await params;
    id = p?.id ?? "";
  } catch {
    notFound();
  }
  if (!id) notFound();

  const project = await getProject(id);
  if (!project) notFound();

  return <HubDetail project={project} />;
}
