# 3D Print Studio

写真1枚からAIが3Dモデルを生成し、3Dプリント業者に入稿できるWebアプリ。

## 機能

- 📸 カメラ撮影 or ファイルアップロード（iPhone/Android対応）
- 🤖 Tripo3D AI による画像→3D変換（死角をAIが補完）
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

`.env.local` を編集して Tripo3D APIキーを設定：

```
TRIPO_API_KEY=your_tripo_api_key_here
```

Tripo3D のAPIキーは https://platform.tripo3d.ai/ から無料で取得できます（登録でクレジット付与）。

### 3. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセス。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **UI**: Tailwind CSS（モバイルファースト）
- **3Dビューア**: React Three Fiber + Three.js
- **AI 3D生成**: Tripo3D API（image-to-3D、無料枚あり）
- **出力形式**: STL / OBJ / GLB / FBX

## デプロイ

Vercel へのデプロイが最も簡単です。環境変数 `TRIPO_API_KEY` を設定してください。
