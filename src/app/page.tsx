"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/UploadZone";
import ProgressTracker from "@/components/ProgressTracker";

type AppState = "idle" | "uploading" | "submitted" | "error";

const TIPS = [
  "白い背景や、被写体がはっきり見える写真が最適です",
  "自然光の元での撮影がモデルの精度を高めます",
  "盆栽・フィギュア・建築模型など様々なオブジェクトに対応",
  "正面からだけでなく斜め上から撮影すると精度が上がります",
];

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [appState, setAppState] = useState<AppState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setAppState("idle");
    setErrorMsg("");
  }, []);

  const handleGenerate = async () => {
    if (!file) return;
    setAppState("uploading");
    setErrorMsg("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成リクエストに失敗しました");
      setAppState("submitted");
      router.push(`/preview/${data.taskId}`);
    } catch (err) {
      setAppState("error");
      setErrorMsg(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  const isProcessing = appState === "uploading" || appState === "submitted";

  return (
    <div className="min-h-dvh flex flex-col bg-[#0a0a0f]">
      <header className="px-4 pt-6 pb-4 text-center">
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/60 text-xs">AI powered by Tripo3D</span>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">3D Print Studio</h1>
        <p className="text-white/50 text-sm max-w-xs mx-auto">写真1枚をAIが3Dモデルに変換。そのまま業者に入稿できます。</p>
      </header>
      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full space-y-4">
        <UploadZone onFileSelect={handleFileSelect} disabled={isProcessing} />
        {!file && (
          <div className="glass rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-purple-400 text-lg shrink-0">💡</span>
            <p className="text-white/60 text-sm">{TIPS[tipIndex]}</p>
          </div>
        )}
        {appState === "error" && (
          <div className="glass border border-red-500/30 rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-red-400 text-lg shrink-0">⚠️</span>
            <p className="text-red-300 text-sm">{errorMsg}</p>
          </div>
        )}
        {isProcessing && (
          <ProgressTracker
            progress={appState === "submitted" ? 100 : 50}
            status={appState === "uploading" ? "サーバーへ送信中..." : "AIに処理を依頼しました"}
            stage={appState === "submitted" ? "finishing" : "uploading"}
          />
        )}
        {file && !isProcessing && (
          <button onClick={handleGenerate} className="btn-primary w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AIで3Dモデルを生成する
          </button>
        )}
        <section className="mt-6 space-y-3">
          <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider text-center">使い方</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "📸", label: "撮影", desc: "被写体を撮影またはアップロード" },
              { icon: "🤖", label: "AI生成", desc: "AIが死角を補い3D化" },
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
        <section className="glass rounded-2xl p-4">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">対応3Dプリント業者（例）</p>
          <div className="flex flex-wrap gap-2">
            {["DMM.make", "Shapeways", "i.materialise", "Sculpteo", "JLC3DP"].map((s) => (
              <span key={s} className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/60">{s}</span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
