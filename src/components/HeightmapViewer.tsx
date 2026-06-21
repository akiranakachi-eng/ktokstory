"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { HeightmapData } from "@/lib/heightmap";
import { heightmapToSTL } from "@/lib/stlExport";

function HeightSurface({ heightmap }: { heightmap: HeightmapData }) {
  const geometry = useMemo(() => {
    const { data, width, height } = heightmap;
    const geo = new THREE.PlaneGeometry(10, 10, width - 1, height - 1);
    const positions = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < width * height; i++) {
      positions[i * 3 + 2] = data[i] * 3;
    }
    geo.computeVertexNormals();
    return geo;
  }, [heightmap]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        color="#a78bfa"
        roughness={0.5}
        metalness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function HeightmapViewer({ heightmap }: { heightmap: HeightmapData }) {
  const handleDownload = () => {
    const blob = heightmapToSTL(heightmap.data, heightmap.width, heightmap.height);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model.stl";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl overflow-hidden" style={{ height: 320 }}>
        <Canvas camera={{ position: [0, 8, 8], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <directionalLight position={[-5, 5, -5]} intensity={0.4} />
          <HeightSurface heightmap={heightmap} />
          <OrbitControls />
        </Canvas>
      </div>

      <div className="glass rounded-2xl p-3 text-center">
        <p className="text-white/40 text-xs">ドラッグで回転 · ピンチで拡大縮小</p>
      </div>

      <button
        onClick={handleDownload}
        className="btn-primary w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        STLをダウンロード（3Dプリント用）
      </button>

      <div className="glass rounded-2xl p-4 space-y-2">
        <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
          3Dプリント業者への依頼
        </h3>
        <ul className="space-y-2 text-sm text-white/60">
          {[
            "STLファイルをダウンロード",
            "DMM.make・Shapeways などの業者サイトへアクセス",
            "STLをアップロードして素材・サイズを選択",
            "注文して数日〜1週間で届きます",
          ].map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-purple-400 shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
