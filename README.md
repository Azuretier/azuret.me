# azuret.me - Personal Portfolio

A modern personal portfolio website built with Next.js 15 and React 19, featuring interactive 3D visualizations with WebGL shaders and voxel terrain effects.

Next.js 15とReact 19で構築されたモダンなポートフォリオサイト。WebGLシェーダーとボクセル地形エフェクトによるインタラクティブな3Dビジュアライゼーションを特徴としています。

## Features / 特徴

- 🎨 Beautiful Japanese-inspired design / 美しい和風デザイン
- 🌧️ Rain shader animation with WebGL / WebGLによる雨シェーダーアニメーション
- 🏔️ Interactive voxel terrain visualization / インタラクティブなボクセル地形ビジュアライゼーション
- 📱 Fully responsive layout / 完全レスポンシブレイアウト
- 🚀 Built with Next.js 15 and React 19 / Next.js 15とReact 19で構築
- 🎮 Three.js + React Three Fiber integration / Three.js + React Three Fiber統合
- 💅 CSS Modules & Tailwind CSS for styling / CSS ModulesとTailwind CSSによるスタイリング

## Project Structure / プロジェクト構成

```
azuret.me/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── page.tsx            # メインページコンポーネント
│   │   ├── globals.css         # グローバルスタイル
│   │   ├── home.module.css     # ホームページスタイル
│   │   ├── api/                # APIルート
│   │   ├── links/              # リンクページ
│   │   └── profiles/           # プロフィールページ
│   ├── components/
│   │   ├── RainCanvas.tsx      # WebGL雨シェーダーエフェクト
│   │   └── VoxelTerrainCanvas.tsx  # 3Dボクセル地形ビジュアライゼーション
│   ├── lib/                    # ユーティリティライブラリ
│   └── styles/                 # 追加スタイル
├── public/
│   ├── shaders/                # GLSLシェーダーファイル
│   └── media/                  # メディアアセット
└── package.json
```

## Technologies / 使用技術

- Next.js 15
- React 19
- TypeScript
- Three.js with React Three Fiber
- Tailwind CSS 4
- CSS Modules
- WebGL/GLSL Shaders

## License / ライセンス

MIT
