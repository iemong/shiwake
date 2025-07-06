# Photo Sorter (Browser‑only) — **仕様書 v1.0**

*最終更新: DATE_PLACEHOLDER*

---

## 0. 目的
SDカード内の **JPEG/DNG** 写真を高速にプレビューし、ペア単位で選別・移動・削除できる **ブラウザ専用 PWA** を実装する。  
対象ブラウザは **Chromium 122+ (Chrome/Edge)** のみとし、他ブラウザはサポート外と明示する。

---

## 1. アーキテクチャ

| 層 | 技術 | 詳細 |
| --- | --- | --- |
| UI | React + shadcn/ui + Tailwind (黒基調) | Vite ビルド。`darkMode: 'class'` 固定。 |
| コアロジック | Rust → WASM (`photo_sort_core`) | `wasm-bindgen`, `wasm-pack`。Worker 内で実行。 |
| バンドラ | Vite + vite‑plugin‑wasm‑pack | HMR 対応。 |
| ファイル I/O | File System Access API | `showDirectoryPicker()` ＆ **永続ハンドル**取得。 |
| 画像デコード | WASM<br>• JPEG: libjpeg‑turbo<br>• DNG: dng‑rs | SIMD 有効。 |
| キャッシュ | **キャッシュしない** | サムネイルはメモリ保持のみ。 |
| PWA | Workbox + Manifest | オフライン起動可。 |
| テスト | Vitest (JS) / wasm‑bindgen‑test (Rust) | GitHub Actions 2系統。 |
| ドキュメント | Storybook (vite builder) | コンポーネントカタログ。 |

---

## 2. プロジェクト構成

```text
photo-sort/
├─ package.json            # pnpm
├─ pnpm-workspace.yaml
├─ vite.config.ts
├─ .storybook/
│   ├─ main.ts
│   └─ preview.ts
├─ src/
│   ├─ wasm/               # ← Rust crate (photo_sort_core)
│   │   └─ src/
│   ├─ wasm/pkg/           # wasm-pack 出力 (git ignore)
│   ├─ components/         # shadcn/ui ベース
│   ├─ app/                # ルーティング
│   ├─ hooks/
│   └─ styles/
└─ tsconfig.json
```

---

## 3. ユーザーストーリー

| ID | ストーリー | 受入条件 |
| --- | --- | --- |
| US‑01 | SDカードフォルダを選択して閲覧したい | ルート選択 → 一覧表示が始まる |
| US‑02 | JPG+DNG をペア表示したい | basename グループ化／束で選択可 |
| US‑03 | サムネイルを素早く確認したい | 1000 枚で 1 s 以内にプレースホルダ表示 |
| US‑04 | 拡張子・日付などで絞り込みたい | フィルタ UI が即応 |
| US‑05 | ペアをまとめて移動・削除したい | ドラッグ or 右クリックメニュー |
| US‑06 | 撮影メタデータを確認したい | サイドペインに瞬時表示 |
| US‑07 | オフラインでも使いたい | PWA install → オフライン起動可 |

---

## 4. 非機能要件

| 観点 | 目標値 |
| --- | --- |
| 初期レンダ | 1000 枚 → **1 s** 以内にプレースホルダ |
| メモリ上限 | 512 MB 未満<br>スクロール外で `revokeObjectURL()` |
| デコード速度 | JPEG ≥ 20 枚/s, DNG ≥ 5 枚/s (M1) |
| セキュリティ | COOP/COEP 設定 (Cloudflare Pages / Vercel) |
| 権限復元 | 永続ハンドル失効時は Picker 再表示 |

---

## 5. エラーハンドリング & UX

* バッチ操作中の失敗は **個別リトライ** ボタンを提示
* 進捗表示: `<ProgressBar value={'{'}0‑100{'}'} />`
* SDカード抜去・PermissionError → トースト＋自動復旧ガイド

---

## 6. カスタムテーマ (shadcn/ui)

* ベースカラー:
    - `--background‑dark: #0d0d0d`
    - `--foreground‑dark: #e5e7eb` (tailwind `zinc‑200`)
* コントラスト比: 全要素 AA 準拠 (≥ 4.5:1)
* Tailwind `@layer base` で全体ダーク固定 (`body` に `class="dark"`)

---

## 7. ビルド・テスト・CI

| パイプライン | 内容 |
| --- | --- |
| **pnpm scripts** | `dev`, `build`, `storybook`, `test`, `wasm:build` |
| Node CI | Vitest / ESLint / a11y-lint |
| Rust CI | `cargo test` + `wasm-bindgen-test --headless --chrome` |
| Deploy | Push → Vercel / CF Pages (COOP/COEP 自動付与) |

---

## 8. ライセンス

* App 全体: **MIT**
* 依存ライブラリ:
    - dng‑rs (MIT)
    - libjpeg‑turbo (Rev 3 BSD‑like)

---

## 9. 既知の制約 & 今後の検討

1. DNG 以外の RAW (CR3/NEF 等) は非対応 — 拡張方針を文書化
2. Chrome 専用。Safari/Firefox ユーザへはサポート外表示
3. キャッシュ無し設計のため、再訪時サムネ生成に時間がかかる可能性

---

## 10. スプリント0 (1 週)

1. **環境構築**: `pnpm i` → `pnpm wasm:build` → `pnpm dev`
2. **ヘッダ PoC**: デプロイ & `crossOriginIsolated === true` を確認
3. **Color Palette Story** 作成 & コントラスト lint
4. **永続ハンドルフロー PoC**
5. CI (Node+Rust) セットアップ

---