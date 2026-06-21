"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import UploadZone from "@/components/UploadZone";
import { imageToHeightmap } from "@/lib/heightmap";
import type { HeightmapData } from "@/lib/heightmap";

const HeightmapViewer = dynamic(() => import("@/components/HeightmapViewer"), {
  ssr: false,
  loading: () => (
    <div className="glass rounded-2xl p-6 text-center">
      <p className="text-white/40 text-sm">ビューア読み込み中...</p>
    </div>
  ),
});

type AppState = "idle" | "processing" | "done" | "error";

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [heightmap, setHeightmap] = useState<HeightmapData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileSelect = async (file: File) => {
    setAppState("processing");
    setErrorMsg("");
    setHeightmap(null);
    try {
      const data = await imageToHeightmap(file, 128);
      setHeightmap(data);
      setAppState("done");
    } catch (err) {
      setAppState("error");
      setErrorMsg(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  const isProcessing = appState === "processing";

  return (
    <div className="min-h-dvh flex flex-col bg-[#0a0a0f]">
      <header className="px-4 pt-6 pb-4 text-center">
        <h1 className="text-3xl font-bold gradient-text mb-2">3D Print Studio</h1>
        <p className="text-white/50 text-sm max-w-xs mx-auto">
          写真から3Dレリーフモデルを生成。STLで業者に入稿できます。
        </p>
      </header>

      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full space-y-4">
        <UploadZone onFileSelect={handleFileSelect} disabled={isProcessing} />

        {isProcessing && (
          <div className="glass rounded-2xl p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-white/60 text-sm">3Dモデルを生成中...</p>
          </div>
        )}

        {appState === "error" && (
          <div className="glass border border-red-500/30 rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-red-400 text-lg shrink-0">⚠️</span>
            <p className="text-red-300 text-sm">{errorMsg}</p>
          </div>
        )}

        {appState === "done" && heightmap && (
          <HeightmapViewer heightmap={heightmap} />
        )}

        {appState === "idle" && (
          <section className="mt-2">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "📸", label: "撮影", desc: "写真を撮影またはアップロード" },
                { icon: "⚙️", label: "3D変換", desc: "画像から自動で3D化" },
                { icon: "🖨️", label: "入稿", desc: "STLを業者サイトへ送信" },
              ].map((step) => (
                <div key={step.label} className="glass rounded-2xl p-3 text-center">
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <div className="text-white text-xs font-semibold mb-1">{step.label}</div>
                  <div className="text-white/40 text-xs leading-tight">{step.desc}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
