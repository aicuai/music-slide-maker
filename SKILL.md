---
name: marp-lyric-video
description: "Use this skill whenever the user wants to create lyric videos, music videos, or animated presentations from Markdown. Triggers include: 'lyric video', 'リリックビデオ', 'MV作成', 'music video', 'Marp to video', 'Remotion', 'スライド動画', 'animated slides', or any request to convert Markdown/text into video format. Also use when adding animations to presentations, syncing text to music, or creating karaoke-style videos. This skill combines Marp (Markdown presentations) with Remotion (React video framework) to generate MP4 videos."
license: MIT
---

# Marp Lyric Video Skill

Marp Markdown → リリックビデオ（MP4）変換

## Quick Reference

| Task | Command |
|------|---------|
| プレビュー | `npm run studio` |
| 動画レンダリング | `npm run render` |
| カスタム変換 | `npm run convert -- -i lyrics.md -o output.mp4` |
| 音楽付き変換 | `npm run convert -- -i lyrics.md -a bgm.mp3 -o output.mp4` |

---

## セットアップ

```bash
cd marp-lyric-video
npm install
```

**必要環境:**
- Node.js 18+
- FFmpeg（動画出力用）

---

## Markdownファイル作成

### 基本フォーマット

```markdown
---
marp: true
---

<!-- duration: 3 -->
# 最初の歌詞

---

<!-- duration: 2.5 -->
2番目の歌詞

---

<!-- duration: 4 -->
# 🎵 The End
```

### ディレクティブ

| ディレクティブ | 説明 | 例 |
|--------------|------|-----|
| `duration` | 表示秒数 | `<!-- duration: 2.5 -->` |

**CRITICAL:** 各スライドは `---` で区切る。`<!-- duration: N -->`はスライドの先頭に記述。

---

## 動画レンダリング

### 基本レンダリング

```bash
# デフォルト設定（1080p, 30fps）
npm run render

# プレビュー版（720p）
npm run render:preview
```

### CLI詳細オプション

```bash
npm run convert -- [options]

Options:
  -i, --input <file>      入力Markdownファイル（必須）
  -o, --output <file>     出力MP4ファイル
  -a, --audio <file>      BGM音楽ファイル
  --fps <number>          フレームレート（30/60）
  --width <number>        動画幅（1920/1280）
  --height <number>       動画高さ（1080/720）
  --bg <color>            背景色（HEX）
  --color <color>         文字色（HEX）
  --font-size <number>    フォントサイズ（px）
  --animation <type>      fade|slide|scale|typewriter|none
```

### レンダリング例

```bash
# ネオン風
npm run convert -- -i lyrics.md --bg "#0a0a0a" --color "#00ff88" --animation scale

# 落ち着いたスタイル
npm run convert -- -i lyrics.md --bg "#1a1a2e" --color "#e0e0e0" --animation fade

# 音楽付き高画質
npm run convert -- -i lyrics.md -a bgm.mp3 --fps 60 --width 1920 --height 1080
```

---

## アニメーション種類

| Type | 説明 | 使用シーン |
|------|------|----------|
| `fade` | フェードイン/アウト | デフォルト、バラード |
| `slide` | 下→上スライド | アップテンポ |
| `scale` | 拡大インパクト | サビ、強調 |
| `typewriter` | タイプライター | ラップ、語り |
| `none` | 静止 | 静止画風 |

---

## Remotion Studio（プレビュー）

```bash
npm run studio
```

ブラウザで `http://localhost:3000` が開き、リアルタイムプレビュー可能。

### Studioでできること
- タイムラインでフレーム単位確認
- アニメーションの動作確認
- propsの動的変更
- 特定フレームのスクリーンショット

---

## 音楽ファイルの配置

音楽ファイルは `public/` ディレクトリに配置：

```bash
cp ~/music/bgm.mp3 public/
```

CLI使用時は `-a` オプションでファイル名を指定：

```bash
npm run convert -- -i lyrics.md -a bgm.mp3 -o output.mp4
```

**対応形式:** mp3, wav, m4a, ogg

---

## カスタムフォント

### Google Fontsを使用

`src/LyricSlide.tsx` の `fontFamily` を変更：

```typescript
fontFamily: "'Noto Sans JP', 'M PLUS 1p', sans-serif"
```

### ローカルフォント

`public/` にフォントファイルを配置し、CSSで読み込み：

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/CustomFont.woff2') format('woff2');
}
```

---

## コンポーネントカスタマイズ

### 新しいアニメーション追加

`src/LyricSlide.tsx` の `getAnimationStyle()` に追加：

```typescript
case "bounce": {
  const bounce = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
  });
  return {
    transform: `translateY(${interpolate(bounce, [0, 1], [100, 0])}px)`,
    opacity: interpolate(bounce, [0, 1], [0, 1]),
  };
}
```

### 背景エフェクト追加

`src/LyricVideo.tsx` でカスタム背景：

```typescript
<AbsoluteFill>
  {/* パーティクル背景 */}
  <ParticleBackground />
  
  {/* 既存のスライド */}
  {slides.map(...)}
</AbsoluteFill>
```

---

## トラブルシューティング

| 問題 | 解決策 |
|-----|--------|
| 日本語が表示されない | Noto Sans JP をシステムにインストール |
| 音が出ない | `public/`にファイル配置、パス確認 |
| レンダリングが遅い | `--fps 30`に下げる、`--concurrency`調整 |
| メモリ不足 | 長い動画は分割してレンダリング |

### デバッグ

```bash
# 詳細ログ
DEBUG=remotion:* npm run render

# 単一フレーム出力
npx remotion still src/index.ts LyricVideo frame.png --frame=30
```

---

## プログラマティックAPI

Node.jsから直接呼び出し：

```typescript
import { parseMarpMarkdown, generateSequenceData } from "./src/marp-parser";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

// 1. Markdownをパース
const markdown = fs.readFileSync("lyrics.md", "utf-8");
const result = parseMarpMarkdown(markdown);
const { slides } = generateSequenceData(result, 30);

// 2. バンドル
const bundleLocation = await bundle({ entryPoint: "./src/index.ts" });

// 3. レンダリング
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "LyricVideo",
  inputProps: { slides },
});

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: "output.mp4",
  inputProps: { slides },
});
```

---

## 依存関係

| パッケージ | 用途 |
|-----------|------|
| `remotion` | React動画フレームワーク |
| `@remotion/cli` | CLIツール |
| `@remotion/bundler` | バンドラー |
| `@remotion/renderer` | レンダラー |
| `@marp-team/marp-core` | Markdownパーサー |
| `react`, `react-dom` | UI |
| `typescript` | 型システム |

---

## 関連ドキュメント

- [AGENTS.md](./AGENTS.md) - プロジェクト推進ガイド
- [README.md](./README.md) - 一般ユーザー向けドキュメント
- [Remotion Docs](https://www.remotion.dev/docs/)
- [Marp Docs](https://marp.app/)
