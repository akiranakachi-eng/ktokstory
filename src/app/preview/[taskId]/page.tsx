"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ProgressTracker from "@/components/ProgressTracker";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-white/40 text-sm">3Dビューア読み込み中...</div>,
});

type TaskStatus = "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED";
interface TaskData {
  id: string; status: TaskStatus; progress?: number;
  model_urls?: { glb?: string; fbx?: string; obj?: string; stl?: string; };
  error?: string;
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<TaskData | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/status/${taskId}`);
      const data: TaskData = await res.json();
      if (!res.ok) return false;
      setTask(data);
      return data.status === "SUCCEEDED" || data.status === "FAILED" || data.status === "EXPIRED";
    } catch { return false; }
  }, [taskId]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    const run = async () => { const done = await poll(); if (!done) t = setTimeout(run, 4000); };
    run();
    return () => clearTimeout(t);
  }, [poll]);

  const handleDownload = async (url: string, format: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `model_${taskId}.${format}`;
    a.click();
  };

  const isSucceeded = task?.status === "SUCCEEDED";
  const isFailed = task?.status === "FAILED" || task?.status === "EXPIRED";
  const progress = isSucceeded ? 100 : isFailed ? 0 : Math.min(task?.progress ?? 5, 95);
  const statusText = !task ? "タスクを確認中..."
    : task.status === "PENDING" ? "キューに追加されました"
    : task.status === "IN_PROGRESS" ? `AI処理中 (${task.progress ?? 0}%)`
    : task.status === "SUCCEEDED" ? "3Dモデルの生成が完了しました"
    : task.error || "生成に失敗しました";

  return (
    <div className="min-h-dvh flex flex-col bg-[#0a0a0f]">
      <header className="glass border-b border-white/5 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.push("/")} className="p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="戻る">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-semibold text-white text-sm">3Dモデルプレビュー</h1>
          <p className="text-white/40 text-xs font-mono truncate max-w-[200px]">{taskId}</p>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <div className="relative flex-1 min-h-[50vh] bg-[#0d0d18]">
          {isSucceeded && task?.model_urls?.glb ? (
            <ModelViewer glbUrl={task.model_urls.glb} className="w-full h-full min-h-[50vh]" />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
              {isFailed ? (
                <div className="text-center p-8">
                  <div className="text-5xl mb-4">❌</div>
                  <p className="text-red-400 font-medium">生成に失敗しました</p>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-purple-400/50 animate-spin" />
                    <div className="absolute inset-4 rounded-full bg-purple-500/20 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">🎨</div>
                  </div>
                  <p className="text-white/60 text-sm">AIが3Dモデルを生成中です...</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-4 space-y-4">
          {!isSucceeded && <ProgressTracker progress={progress} status={statusText} stage={isFailed ? "error" : "processing"} />}
          {isSucceeded && task?.model_urls && (
            <div className="space-y-3">
              <h2 className="font-semibold text-white text-sm">ダウンロード</h2>
              <div className="grid grid-cols-2 gap-3">
                {task.model_urls.glb && (
                  <button onClick={() => handleDownload(task.model_urls!.glb!, "glb")} className="glass rounded-xl p-3 text-left hover:bg-white/10 transition-colors">
                    <div className="text-purple-400 font-bold text-xs mb-1">GLB</div>
                    <div className="text-white text-sm font-medium">3Dビューア</div>
                    <div className="text-white/40 text-xs">ウェブ・AR対応</div>
                  </button>
                )}
                {task.model_urls.stl && (
                  <button onClick={() => handleDownload(task.model_urls!.stl!, "stl")} className="glass rounded-xl p-3 text-left hover:bg-white/10 transition-colors">
                    <div className="text-blue-400 font-bold text-xs mb-1">STL</div>
                    <div className="text-white text-sm font-medium">3Dプリント</div>
                    <div className="text-white/40 text-xs">業者入稿推奨</div>
                  </button>
                )}
                {task.model_urls.obj && (
                  <button onClick={() => handleDownload(task.model_urls!.obj!, "obj")} className="glass rounded-xl p-3 text-left hover:bg-white/10 transition-colors">
                    <div className="text-green-400 font-bold text-xs mb-1">OBJ</div>
                    <div className="text-white text-sm font-medium">汎用形式</div>
                    <div className="text-white/40 text-xs">編集ソフト対応</div>
                  </button>
                )}
                {task.model_urls.fbx && (
                  <button onClick={() => handleDownload(task.model_urls!.fbx!, "fbx")} className="glass rounded-xl p-3 text-left hover:bg-white/10 transition-colors">
                    <div className="text-orange-400 font-bold text-xs mb-1">FBX</div>
                    <div className="text-white text-sm font-medium">アニメーション</div>
                    <div className="text-white/40 text-xs">Maya・Blender対応</div>
                  </button>
                )}
              </div>
            </div>
          )}
          {isSucceeded && (
            <div className="glass rounded-2xl p-4 space-y-2">
              <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">3Dプリント業者への依頼について</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex gap-2"><span className="text-purple-400 shrink-0">1.</span><span>STLファイルをダウンロードしてください</span></li>
                <li className="flex gap-2"><span className="text-purple-400 shrink-0">2.</span><span>3Dプリント業者（DMM.make, Shapeways等）のサイトへアクセス</span></li>
                <li className="flex gap-2"><span className="text-purple-400 shrink-0">3.</span><span>STLファイルをアップロードして素材・サイズを選択</span></li>
                <li className="flex gap-2"><span className="text-purple-400 shrink-0">4.</span><span>注文完了！数日〜1週間で届きます</span></li>
              </ul>
            </div>
          )}
          {isFailed && (
            <button onClick={() => router.push("/")} className="btn-primary w-full py-3 rounded-xl text-white font-semibold">もう一度試す</button>
          )}
        </div>
      </main>
    </div>
  );
}
