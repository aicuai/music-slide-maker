#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { parseMarpMarkdown, generateSequenceData } from "./marp-parser";

interface RenderOptions {
  input: string;
  output: string;
  audio?: string;
  fps?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  animation?: "fade" | "slide" | "scale" | "typewriter" | "none";
}

async function renderLyricVideo(options: RenderOptions): Promise<void> {
  const {
    input,
    output,
    audio,
    fps = 30,
    width = 1920,
    height = 1080,
    backgroundColor = "#0f0f23",
    textColor = "#ffffff",
    fontSize = 64,
    animation = "fade",
  } = options;

  console.log("📝 Marp Markdownを読み込み中...");
  const markdown = fs.readFileSync(input, "utf-8");

  console.log("🔄 スライドをパース中...");
  const parseResult = parseMarpMarkdown(markdown);
  const sequenceData = generateSequenceData(parseResult, fps);

  console.log(`📊 ${sequenceData.slides.length}枚のスライドを検出`);
  console.log(`⏱️  総再生時間: ${parseResult.totalDuration}秒`);

  // 動的にpropsを生成
  const slides = sequenceData.slides.map((slide) => ({
    text: slide.text,
    startFrame: slide.startFrame,
    durationInFrames: slide.durationInFrames,
    animation,
  }));

  const totalFrames = slides.reduce(
    (max, slide) => Math.max(max, slide.startFrame + slide.durationInFrames),
    0
  );

  console.log("📦 Remotionをバンドル中...");
  const bundleLocation = await bundle({
    entryPoint: path.join(__dirname, "index.ts"),
    // webpackOverride can be added if needed
  });

  console.log("🎬 コンポジションを選択中...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "LyricVideo",
    inputProps: {
      slides,
      audioSrc: audio,
      backgroundColor,
      textColor,
      fontSize,
      defaultAnimation: animation,
    },
  });

  // 動的にdurationを上書き
  const finalComposition = {
    ...composition,
    durationInFrames: totalFrames,
    width,
    height,
    fps,
  };

  console.log("🎥 動画をレンダリング中...");
  await renderMedia({
    composition: finalComposition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: output,
    inputProps: {
      slides,
      audioSrc: audio,
      backgroundColor,
      textColor,
      fontSize,
      defaultAnimation: animation,
    },
  });

  console.log(`✅ 完了！出力: ${output}`);
}

// CLI引数のパース
function parseArgs(): RenderOptions {
  const args = process.argv.slice(2);
  const options: Partial<RenderOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "-i":
      case "--input":
        options.input = next;
        i++;
        break;
      case "-o":
      case "--output":
        options.output = next;
        i++;
        break;
      case "-a":
      case "--audio":
        options.audio = next;
        i++;
        break;
      case "--fps":
        options.fps = parseInt(next, 10);
        i++;
        break;
      case "--width":
        options.width = parseInt(next, 10);
        i++;
        break;
      case "--height":
        options.height = parseInt(next, 10);
        i++;
        break;
      case "--bg":
      case "--background":
        options.backgroundColor = next;
        i++;
        break;
      case "--color":
        options.textColor = next;
        i++;
        break;
      case "--font-size":
        options.fontSize = parseInt(next, 10);
        i++;
        break;
      case "--animation":
        options.animation = next as RenderOptions["animation"];
        i++;
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
    }
  }

  if (!options.input) {
    console.error("❌ エラー: 入力ファイルを指定してください (-i <file>)");
    printHelp();
    process.exit(1);
  }

  if (!options.output) {
    options.output = options.input.replace(/\.md$/, ".mp4");
  }

  return options as RenderOptions;
}

function printHelp(): void {
  console.log(`
🎬 Marp Lyric Video Generator

Usage: npx ts-node src/cli.ts [options]

Options:
  -i, --input <file>      入力Marp Markdownファイル (必須)
  -o, --output <file>     出力動画ファイル (デフォルト: 入力ファイル名.mp4)
  -a, --audio <file>      BGM音楽ファイル
  --fps <number>          フレームレート (デフォルト: 30)
  --width <number>        動画幅 (デフォルト: 1920)
  --height <number>       動画高さ (デフォルト: 1080)
  --bg <color>            背景色 (デフォルト: #0f0f23)
  --color <color>         文字色 (デフォルト: #ffffff)
  --font-size <number>    フォントサイズ (デフォルト: 64)
  --animation <type>      アニメーション: fade|slide|scale|typewriter|none
  -h, --help              ヘルプを表示

Markdown形式:
  ---
  marp: true
  ---

  <!-- duration: 3 -->
  # 歌詞1行目

  ---

  <!-- duration: 2.5 -->
  歌詞2行目
`);
}

// メイン実行
const opts = parseArgs();
renderLyricVideo(opts).catch((err) => {
  console.error("❌ レンダリングエラー:", err);
  process.exit(1);
});
