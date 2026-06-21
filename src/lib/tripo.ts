const TRIPO_API_BASE = "https://api.tripo3d.ai/v2/openapi";

export type TripoTaskStatus = "queued" | "running" | "success" | "failed" | "cancelled" | "unknown";

export interface TripoTask {
  task_id: string;
  type: string;
  status: TripoTaskStatus;
  progress: number;
  result?: {
    pbr_model?: {
      glb?: string;
      fbx?: string;
      obj?: string;
      stl?: string;
      usdz?: string;
    };
    rendered_image?: { url?: string };
  };
  error?: { code: number; suggestion: string };
}

export async function uploadImage(fileBuffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.TRIPO_API_KEY;
  if (!apiKey) throw new Error("TRIPO_API_KEY is not set");

  const ext = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/png" ? "png" : "webp";
  const blob = new Blob([fileBuffer.buffer as ArrayBuffer], { type: mimeType });
  const form = new FormData();
  form.append("file", blob, `upload.${ext}`);

  const res = await fetch(`${TRIPO_API_BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo upload error ${res.status}: ${err}`);
  }

  const json = await res.json();
  if (json.code !== 0) throw new Error(`Tripo upload failed: ${JSON.stringify(json)}`);

  return json.data.image_token;
}

export async function createImageTo3DTask(fileToken: string, mimeType: string): Promise<string> {
  const apiKey = process.env.TRIPO_API_KEY;
  if (!apiKey) throw new Error("TRIPO_API_KEY is not set");

  const fileType = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/png" ? "png" : "webp";

  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "image_to_model",
      file: { type: fileType, file_token: fileToken },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo task error ${res.status}: ${err}`);
  }

  const json = await res.json();
  if (json.code !== 0) throw new Error(`Tripo task failed: ${JSON.stringify(json)}`);

  return json.data.task_id;
}

export async function getTaskStatus(taskId: string): Promise<TripoTask> {
  const apiKey = process.env.TRIPO_API_KEY;
  if (!apiKey) throw new Error("TRIPO_API_KEY is not set");

  const res = await fetch(`${TRIPO_API_BASE}/task/${taskId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo status error ${res.status}: ${err}`);
  }

  const json = await res.json();
  if (json.code !== 0) throw new Error(`Tripo status failed: ${JSON.stringify(json)}`);

  return json.data;
}
