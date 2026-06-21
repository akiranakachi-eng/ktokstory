import { NextRequest, NextResponse } from "next/server";
import { uploadImage, createImageTo3DTask } from "@/lib/tripo";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "画像ファイルが必要です" }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "ファイルサイズは20MB以内にしてください" }, { status: 400 });
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "JPG・PNG・WebP形式のみ対応しています" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileToken = await uploadImage(buffer, file.type);
    const taskId = await createImageTo3DTask(fileToken, file.type);
    return NextResponse.json({ taskId });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "生成に失敗しました" }, { status: 500 });
  }
}
