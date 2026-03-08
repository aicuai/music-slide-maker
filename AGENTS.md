# AGENTS.md - Marp Lyric Video Generator

## プロジェクト概要

**Marp Markdown → リリックビデオ（MP4）変換ツール**

Marp形式のMarkdownで歌詞を記述し、Remotionを使って自動でMusic Video（MP4）に変換するツール。

## プロジェクト構造

```
marp-lyric-video/
├── AGENTS.md              # このファイル
├── SKILL.md               # スキル定義（Claude/AI用）
├── src/
│   ├── index.ts           # Remotionエントリーポイント
│   ├── Root.tsx           # Remotionコンポジション登録
│   ├── LyricVideo.tsx     # メインビデオコンポーネント
│   ├── LyricSlide.tsx     # 個別スライドコンポーネント
│   ├── marp-parser.ts     # Marp Markdown→JSONパーサー
│   └── cli.ts             # CLIツール
├── public/                # 静的ファイル（音楽、画像）
├── out/                   # レンダリング出力先
└── *.md                   # 歌詞Markdownファイル
```

## コマンドリファレンス

### 開発・プレビュー

```bash
# Remotion Studioでプレビュー（ブラウザで確認）
npm run studio

# TypeScript型チェック
npm run typecheck
```

### 動画レンダリング

```bash
# デフォルト設定でレンダリング
npm run render

# プレビュー版（720p、短縮）
npm run render:preview

# CLI経由でカスタムレンダリング
npm run convert -- -i lyrics.md -o output.mp4

# 音楽付き
npm run convert -- -i lyrics.md -o output.mp4 -a bgm.mp3

# フルカスタム
npm run convert -- \
  -i lyrics.md \
  -o output.mp4 \
  -a bgm.mp3 \
  --fps 60 \
  --width 1920 \
  --height 1080 \
  --bg "#0f0f23" \
  --color "#00ff88" \
  --font-size 72 \
  --animation slide
```

### Remotion直接実行

```bash
# 特定コンポジションをレンダリング
npx remotion render src/index.ts LyricVideo out/video.mp4

# カスタムpropsでレンダリング
npx remotion render src/index.ts LyricVideo out/video.mp4 \
  --props='{"slides":[...],"backgroundColor":"#000"}'
```

## Markdownフォーマット

### 基本構造

```markdown
---
marp: true
theme: default
---

<!-- duration: 3 -->
# 歌詞1行目

---

<!-- duration: 2.5 -->
歌詞2行目

---

<!-- duration: 4 -->
# 🎵 The End
```

### ディレクティブ

| ディレクティブ | 説明 | デフォルト |
|--------------|------|-----------|
| `<!-- duration: N -->` | スライド表示時間（秒） | 3 |

### 将来拡張予定

```markdown
<!-- animation: slide -->      # スライドごとのアニメーション
<!-- transition: fade -->      # トランジション効果
<!-- bg: #ff0000 -->           # 背景色オーバーライド
<!-- image: bg.jpg -->         # 背景画像
```

## アニメーション種類

| 種類 | 説明 | 使用シーン |
|-----|------|----------|
| `fade` | フェードイン/アウト | デフォルト、落ち着いた曲 |
| `slide` | 下から上へスライド | アップテンポな曲 |
| `scale` | 拡大表示（インパクト） | サビ、強調部分 |
| `typewriter` | タイプライター効果 | ラップ、語り |
| `none` | アニメーションなし | 静止画風 |

## 開発ガイドライン

### 新機能追加時

1. `src/LyricSlide.tsx` - 新アニメーション追加
2. `src/marp-parser.ts` - 新ディレクティブパース
3. `src/cli.ts` - CLIオプション追加
4. `SKILL.md` - ドキュメント更新

### コード規約

- TypeScript strict mode
- React functional components + hooks
- Remotion hooks使用: `useCurrentFrame()`, `useVideoConfig()`, `spring()`, `interpolate()`

### テスト方法

```bash
# 型チェック
npm run typecheck

# サンプル動画生成
npm run render:preview

# 出力確認
open out/preview.mp4  # macOS
xdg-open out/preview.mp4  # Linux
```

## トラブルシューティング

### よくある問題

| 問題 | 解決策 |
|-----|--------|
| フォントが表示されない | Google Fontsをpublic/に配置、または@font-face定義 |
| 動画が生成されない | `npx remotion --version`で確認、Node.js 18+必須 |
| 音声が再生されない | public/にファイル配置、`staticFile()`で参照 |
| 日本語が文字化け | Noto Sans JP等をインストール |

### デバッグ

```bash
# 詳細ログ付きレンダリング
DEBUG=remotion:* npm run render

# 単一フレームテスト
npx remotion still src/index.ts LyricVideo out/frame.png --frame=30
```

## ロードマップ

### Phase 1 (MVP) ✅
- [x] Marp Markdown パーサー
- [x] 基本4アニメーション
- [x] CLI変換ツール
- [x] 音楽合成

### Phase 2 (計画中)
- [ ] BPM同期機能（音楽ビートに合わせたスライド切替）
- [ ] stable-ts連携（音声からタイムスタンプ自動生成）
- [ ] Webブラウザ版エディタ
- [ ] テンプレートギャラリー

### Phase 3 (将来)
- [ ] AIによる歌詞→スライド自動生成
- [ ] 背景動画/パーティクル効果
- [ ] 多言語字幕対応
- [ ] プラグインシステム

## 関連リソース

- [Remotion公式ドキュメント](https://www.remotion.dev/docs/)
- [Marp公式](https://marp.app/)
- [AICU Inc.](https://aicu.ai)
