# 🎬 Marp Lyric Video Generator

**Marp Markdown → リリックビデオ（MP4）変換ツール**

Markdownで歌詞を書いて、自動でMusic Videoに変換！

## ✨ 特徴

- 📝 **Marp Markdown形式**で歌詞を記述
- ⏱️ **スライドごとの表示時間**を指定可能
- 🎨 **4種類のアニメーション**: fade, slide, scale, typewriter
- 🎵 **音楽ファイル**との合成対応
- 📺 **1080p/720p**高画質出力

## 🚀 クイックスタート

```bash
# インストール
npm install

# Remotion Studioでプレビュー
npm run studio

# サンプル動画をレンダリング
npm run render
```

## 📝 Markdownフォーマット

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

- `<!-- duration: 秒数 -->` - スライドの表示時間（デフォルト: 3秒）

## 🛠️ CLI使用方法

```bash
# 基本的な変換
npm run convert -- -i lyrics.md -o output.mp4

# 音楽付き
npm run convert -- -i lyrics.md -o output.mp4 -a bgm.mp3

# カスタマイズ
npm run convert -- \
  -i lyrics.md \
  -o output.mp4 \
  --fps 60 \
  --width 1920 \
  --height 1080 \
  --bg "#1a1a2e" \
  --color "#00ff88" \
  --animation slide
```

### オプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `-i, --input` | 入力Markdownファイル | (必須) |
| `-o, --output` | 出力MP4ファイル | {input}.mp4 |
| `-a, --audio` | BGM音楽ファイル | - |
| `--fps` | フレームレート | 30 |
| `--width` | 動画幅 | 1920 |
| `--height` | 動画高さ | 1080 |
| `--bg` | 背景色 | #0f0f23 |
| `--color` | 文字色 | #ffffff |
| `--font-size` | フォントサイズ | 64 |
| `--animation` | アニメーション種類 | fade |

### アニメーション種類

- `fade` - フェードイン/アウト
- `slide` - 下から上へスライド
- `scale` - 拡大表示
- `typewriter` - タイプライター効果
- `none` - アニメーションなし

## 📁 プロジェクト構造

```
marp-lyric-video/
├── src/
│   ├── index.ts          # エントリーポイント
│   ├── Root.tsx          # Remotionルート
│   ├── LyricVideo.tsx    # メインコンポジション
│   ├── LyricSlide.tsx    # スライドコンポーネント
│   ├── marp-parser.ts    # Marpパーサー
│   └── cli.ts            # CLIツール
├── public/               # 静的ファイル（音楽等）
├── sample-lyrics.md      # サンプル歌詞
└── package.json
```

## 🎨 カスタマイズ例

### ネオン風スタイル
```bash
npm run convert -- -i lyrics.md --bg "#0a0a0a" --color "#00ff88"
```

### 落ち着いたスタイル
```bash
npm run convert -- -i lyrics.md --bg "#1a1a2e" --color "#e0e0e0" --animation fade
```

### アクティブなスタイル
```bash
npm run convert -- -i lyrics.md --bg "#000" --color "#ff0080" --animation scale
```

## 📄 ライセンス

MIT License - AICU Inc.

---

Made with ❤️ by [AICU Inc.](https://aicu.ai)
