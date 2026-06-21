// Generates a watertight binary STL solid from heightmap data.
// Output: top surface (displaced), flat bottom, four side walls.
// Physical dimensions: 100mm x 100mm x up to 20mm height, 3mm base.
export function heightmapToSTL(
  data: Float32Array,
  width: number,
  height: number
): Blob {
  const scaleXY = 100;
  const maxRelief = 20;
  const base = 3;

  const w = width;
  const h = height;
  const topTris = (w - 1) * (h - 1) * 2;
  const bottomTris = (w - 1) * (h - 1) * 2;
  const wallTris = ((h - 1) + (h - 1) + (w - 1) + (w - 1)) * 2;
  const totalTris = topTris + bottomTris + wallTris;

  const buf = new ArrayBuffer(84 + totalTris * 50);
  const view = new DataView(buf);

  const hdr = "3D Print Studio Relief Model";
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < hdr.length ? hdr.charCodeAt(i) : 0);
  }
  view.setUint32(80, totalTris, true);

  let off = 84;

  const px = (i: number) => (i / (w - 1)) * scaleXY;
  const py = (j: number) => (j / (h - 1)) * scaleXY;
  const pz = (i: number, j: number) => base + data[j * w + i] * maxRelief;

  function tri(
    nx: number, ny: number, nz: number,
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number
  ) {
    const f = (v: number) => { view.setFloat32(off, v, true); off += 4; };
    f(nx); f(ny); f(nz);
    f(x0); f(y0); f(z0);
    f(x1); f(y1); f(z1);
    f(x2); f(y2); f(z2);
    view.setUint16(off, 0, true);
    off += 2;
  }

  for (let j = 0; j < h - 1; j++) {
    for (let i = 0; i < w - 1; i++) {
      const x0 = px(i),   y0 = py(j),   z0 = pz(i,   j);
      const x1 = px(i+1), y1 = py(j),   z1 = pz(i+1, j);
      const x2 = px(i+1), y2 = py(j+1), z2 = pz(i+1, j+1);
      const x3 = px(i),   y3 = py(j+1), z3 = pz(i,   j+1);
      tri(0, 0, 1, x0, y0, z0, x1, y1, z1, x2, y2, z2);
      tri(0, 0, 1, x0, y0, z0, x2, y2, z2, x3, y3, z3);
    }
  }

  for (let j = 0; j < h - 1; j++) {
    for (let i = 0; i < w - 1; i++) {
      const x0 = px(i),   y0 = py(j);
      const x2 = px(i+1), y2 = py(j+1);
      const x1 = px(i+1), y1 = py(j);
      const x3 = px(i),   y3 = py(j+1);
      tri(0, 0, -1, x0, y0, 0, x2, y2, 0, x1, y1, 0);
      tri(0, 0, -1, x0, y0, 0, x3, y3, 0, x2, y2, 0);
    }
  }

  for (let j = 0; j < h - 1; j++) {
    const y0 = py(j),   z0 = pz(0, j);
    const y1 = py(j+1), z1 = pz(0, j+1);
    tri(-1, 0, 0, 0, y0, z0, 0, y1, z1, 0, y1, 0);
    tri(-1, 0, 0, 0, y0, z0, 0, y1, 0,  0, y0, 0);
    void z1;
  }

  const xR = px(w - 1);
  for (let j = 0; j < h - 1; j++) {
    const y0 = py(j),   z0 = pz(w-1, j);
    const y1 = py(j+1), z1 = pz(w-1, j+1);
    tri(1, 0, 0, xR, y0, z0, xR, y1, 0,  xR, y1, z1);
    tri(1, 0, 0, xR, y0, z0, xR, y0, 0,  xR, y1, 0);
    void z1;
  }

  for (let i = 0; i < w - 1; i++) {
    const x0 = px(i),   z0 = pz(i,   0);
    const x1 = px(i+1), z1 = pz(i+1, 0);
    tri(0, -1, 0, x0, 0, z0, x1, 0, 0,  x1, 0, z1);
    tri(0, -1, 0, x0, 0, z0, x0, 0, 0,  x1, 0, 0);
    void z1;
  }

  const yB = py(h - 1);
  for (let i = 0; i < w - 1; i++) {
    const x0 = px(i),   z0 = pz(i,   h-1);
    const x1 = px(i+1), z1 = pz(i+1, h-1);
    tri(0, 1, 0, x0, yB, z0, x1, yB, z1, x1, yB, 0);
    tri(0, 1, 0, x0, yB, z0, x1, yB, 0,  x0, yB, 0);
    void z1;
  }

  return new Blob([buf], { type: "application/octet-stream" });
}
