export interface HeightmapData {
  data: Float32Array;
  width: number;
  height: number;
}

export async function imageToHeightmap(
  file: File,
  resolution = 128
): Promise<HeightmapData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = resolution;
        canvas.height = resolution;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");

        ctx.drawImage(img, 0, 0, resolution, resolution);
        const { data: pixels } = ctx.getImageData(0, 0, resolution, resolution);

        const heights = new Float32Array(resolution * resolution);
        for (let i = 0; i < resolution * resolution; i++) {
          const r = pixels[i * 4] / 255;
          const g = pixels[i * 4 + 1] / 255;
          const b = pixels[i * 4 + 2] / 255;
          heights[i] = 0.299 * r + 0.587 * g + 0.114 * b;
        }

        resolve({
          data: boxBlur(heights, resolution, resolution, 2),
          width: resolution,
          height: resolution,
        });
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };

    img.src = url;
  });
}

function boxBlur(
  data: Float32Array,
  w: number,
  h: number,
  radius: number
): Float32Array {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            sum += data[ny * w + nx];
            count++;
          }
        }
      }
      out[y * w + x] = sum / count;
    }
  }
  return out;
}
