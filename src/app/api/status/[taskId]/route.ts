import { NextRequest, NextResponse } from "next/server";
import { getTaskStatus, TripoTask } from "@/lib/tripo";

function normalize(task: TripoTask) {
  const statusMap = {
    queued: "PENDING", running: "IN_PROGRESS", success: "SUCCEEDED",
    failed: "FAILED", cancelled: "FAILED", unknown: "FAILED",
  } as const;
  return {
    id: task.task_id,
    status: statusMap[task.status] ?? "PENDING",
    progress: task.progress ?? 0,
    model_urls: task.result?.pbr_model ? {
      glb: task.result.pbr_model.glb,
      fbx: task.result.pbr_model.fbx,
      obj: task.result.pbr_model.obj,
      stl: task.result.pbr_model.stl,
    } : undefined,
    thumbnail_url: task.result?.rendered_image?.url,
    error: task.error?.suggestion,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await params;
    if (!taskId) return NextResponse.json({ error: "タスクIDが必要です" }, { status: 400 });
    const task = await getTaskStatus(taskId);
    return NextResponse.json(normalize(task));
  } catch (err) {
    console.error("Status error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "ステータス取得に失敗しました" }, { status: 500 });
  }
}
