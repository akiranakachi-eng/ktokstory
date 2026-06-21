import { NextRequest, NextResponse } from "next/server";
import { getTaskStatus } from "@/lib/meshy";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json({ error: "タスクIDが必要です" }, { status: 400 });
    }

    const task = await getTaskStatus(taskId);
    return NextResponse.json(task);
  } catch (err) {
    console.error("Status error:", err);
    const message = err instanceof Error ? err.message : "ステータス取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
