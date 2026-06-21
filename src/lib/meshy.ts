const MESHY_API_BASE = "https://api.meshy.ai/openapi/v2";

export type MeshyTaskStatus = "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED";

export interface MeshyTask {
  id: string;
  status: MeshyTaskStatus;
  progress?: number;
  model_urls?: {
    glb?: string;
    fbx?: string;
    obj?: string;
    stl?: string;
    usdz?: string;
  };
  thumbnail_url?: string;
  error?: string;
  created_at?: number;
  finished_at?: number;
}

export async function createImageTo3DTask(
  imageBase64: string,
  mimeType: string,
  options: {
    enable_pbr?: boolean;
    ai_model?: string;
  } = {}
): Promise<{ result: string }> {
  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) throw new Error("MESHY_API_KEY is not set");

  const dataUri = `data:${mimeType};base64,${imageBase64}`;

  const body = {
    image_url: dataUri,
    enable_pbr: options.enable_pbr ?? true,
    ai_model: options.ai_model ?? "meshy-4",
    topology: "quad",
    target_polycount: 30000,
  };

  const res = await fetch(`${MESHY_API_BASE}/image-to-3d`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meshy API error ${res.status}: ${err}`);
  }

  return res.json();
}

export async function getTaskStatus(taskId: string): Promise<MeshyTask> {
  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) throw new Error("MESHY_API_KEY is not set");

  const res = await fetch(`${MESHY_API_BASE}/image-to-3d/${taskId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meshy API error ${res.status}: ${err}`);
  }

  return res.json();
}
