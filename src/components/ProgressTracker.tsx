"use client";

interface ProgressTrackerProps {
  progress: number; status: string;
  stage: "uploading" | "processing" | "finishing" | "done" | "error";
}

const STAGE_LABELS = { uploading: "画像をアップロード中...", processing: "AIが3Dモデルを生成中...", finishing: "仕上げ処理中...", done: "完成！", error: "エラーが発生しました" };
const STAGE_ICONS = { uploading: "⬆️", processing: "🧠", finishing: "✨", done: "✅", error: "❌" };

export default function ProgressTracker({ progress, status, stage }: ProgressTrackerProps) {
  const isError = stage === "error", isDone = stage === "done";
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{STAGE_ICONS[stage]}</span>
        <div>
          <p className={`font-semibold ${isError ? "text-red-400" : isDone ? "text-green-400" : "text-white"}`}>{STAGE_LABELS[stage]}</p>
          {status && <p className="text-white/50 text-sm mt-0.5">{status}</p>}
        </div>
      </div>
      {!isError && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-white/40"><span>進捗</span><span>{Math.round(progress)}%</span></div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${isDone ? "bg-green-400" : "bg-gradient-to-r from-purple-500 to-blue-500"}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {stage === "processing" && <p className="text-white/40 text-xs">通常2〜5分かかります。このページを開いたままにしてください。</p>}
    </div>
  );
}
