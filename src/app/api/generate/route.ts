import { NextRequest, NextResponse } from "next/server";
import { createImageTo3DTask } from "@/lib/meshy";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "画像ファイルが必要です" }, { status: 400 });
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "ファイルサイズは20MB以内にしてください" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "JPG・PNG・WebP形式のみ対応しています" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const result = await createImageTo3DTask(base64, file.type, {
      enable_pbr: true,
    });

    return NextResponse.json({ taskId: result.result });
  } catch (err) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "生成に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
