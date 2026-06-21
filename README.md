# 3D Print Studio

写真1枚からAIが3Dモデルを生成し、3Dプリント業者に入稿できるWebアプリ。

## 機能

- 📸 カメラ撮影 or ファイルアップロード（iPhone/Android対応）
- 🤖 Meshy AI による画像→3D変換（死角をAIが補完）
- 🎮 インタラクティブな3Dモデルプレビュー（回転・ズーム）
- 📥 STL / OBJ / GLB / FBX ダウンロード
- 🖨️ 3Dプリント業者（DMM.make, Shapeways等）への入稿ガイド

## セットアップ

### 1. 依存関係インストール

```bash
npm install
```

### 2. APIキー設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して Meshy AI APIキーを設定：

```
MESHY_API_KEY=your_meshy_api_key_here
```

Meshy AI のAPIキーは https://app.meshy.ai/ から無料で取得できます。

### 3. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセス。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **UI**: Tailwind CSS（モバイルファースト）
- **3Dビューア**: React Three Fiber + Three.js
- **AI 3D生成**: Meshy AI API（image-to-3D）
- **出力形式**: STL / OBJ / GLB / FBX

## デプロイ

Vercel へのデプロイが最も簡単です。環境変数 `MESHY_API_KEY` を設定してください。
