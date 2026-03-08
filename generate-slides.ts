#!/usr/bin/env node
/**
 * Marp歌詞スライド生成ヘルパー
 * 
 * 使い方:
 *   npx ts-node src/generate-slides.ts --lyrics "歌詞1|歌詞2|歌詞3" --output lyrics.md
 *   npx ts-node src/generate-slides.ts --file lyrics.txt --output lyrics.md
 *   npx ts-node src/generate-slides.ts --json slides.json --output lyrics.md
 */

import * as fs from "fs";
import * as path from "path";

interface SlideConfig {
  text: string;
  duration?: number;
  animation?: string;
}

interface GenerateOptions {
  theme?: string;
  defaultDuration?: number;
  defaultAnimation?: string;
}

/**
 * スライド配列からMarp Markdownを生成
 */
function generateMarpMarkdown(
  slides: SlideConfig[],
  options: GenerateOptions = {}
): string {
  const {
    theme = "default",
    defaultDuration = 3,
    defaultAnimation = "fade",
  } = options;

  const frontmatter = `---
marp: true
theme: ${theme}
paginate: false
---
`;

  const slideMarkdown = slides
    .map((slide, index) => {
      const duration = slide.duration ?? defaultDuration;
      const animation = slide.animation ?? defaultAnimation;
      
      // 最初のスライドは --- 不要
      const separator = index === 0 ? "" : "\n---\n";
      
      return `${separator}
<!-- duration: ${duration} -->
<!-- animation: ${animation} -->
${slide.text}
`;
    })
    .join("");

  return frontmatter + slideMarkdown;
}

/**
 * テキストファイル（1行1スライド）を読み込み
 */
function parseTextFile(filePath: string): SlideConfig[] {
  const content = fs.readFileSync(filePath, "utf-8");
  return content
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      // フォーマット: "歌詞テキスト [duration:3] [animation:fade]"
      const durationMatch = line.match(/\[duration:(\d+(?:\.\d+)?)\]/);
      const animationMatch = line.match(/\[animation:(\w+)\]/);
      
      const text = line
        .replace(/\[duration:\d+(?:\.\d+)?\]/, "")
        .replace(/\[animation:\w+\]/, "")
        .trim();

      return {
        text,
        duration: durationMatch ? parseFloat(durationMatch[1]) : undefined,
        animation: animationMatch ? animationMatch[1] : undefined,
      };
    });
}

/**
 * JSONファイルを読み込み
 */
function parseJsonFile(filePath: string): SlideConfig[] {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * パイプ区切り文字列をパース
 */
function parsePipeString(input: string): SlideConfig[] {
  return input.split("|").map((text) => ({ text: text.trim() }));
}

// CLI引数パース
function parseArgs(): {
  slides: SlideConfig[];
  output: string;
  options: GenerateOptions;
} {
  const args = process.argv.slice(2);
  let slides: SlideConfig[] = [];
  let output = "output.md";
  const options: GenerateOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "--lyrics":
      case "-l":
        slides = parsePipeString(next);
        i++;
        break;
      case "--file":
      case "-f":
        slides = parseTextFile(next);
        i++;
        break;
      case "--json":
      case "-j":
        slides = parseJsonFile(next);
        i++;
        break;
      case "--output":
      case "-o":
        output = next;
        i++;
        break;
      case "--theme":
        options.theme = next;
        i++;
        break;
      case "--duration":
        options.defaultDuration = parseFloat(next);
        i++;
        break;
      case "--animation":
        options.defaultAnimation = next;
        i++;
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
    }
  }

  if (slides.length === 0) {
    console.error("❌ スライドデータを指定してください");
    printHelp();
    process.exit(1);
  }

  return { slides, output, options };
}

function printHelp(): void {
  console.log(`
🎬 Marp歌詞スライド生成ヘルパー

Usage:
  npx ts-node src/generate-slides.ts [options]

入力方法（いずれか1つ）:
  -l, --lyrics <text>     パイプ区切りの歌詞
                          例: "歌詞1|歌詞2|歌詞3"
  
  -f, --file <path>       テキストファイル（1行1スライド）
                          行フォーマット: 歌詞 [duration:3] [animation:fade]
  
  -j, --json <path>       JSONファイル
                          [{text:"歌詞", duration:3, animation:"fade"}]

オプション:
  -o, --output <path>     出力ファイル（デフォルト: output.md）
  --theme <name>          Marpテーマ（default, gaia, uncover）
  --duration <seconds>    デフォルト表示時間（デフォルト: 3）
  --animation <type>      デフォルトアニメーション（fade, slide, scale, typewriter）
  -h, --help              ヘルプ表示

例:
  # パイプ区切り入力
  npx ts-node src/generate-slides.ts -l "イントロ|Aメロ|サビ" -o lyrics.md

  # テキストファイル入力
  npx ts-node src/generate-slides.ts -f lyrics.txt -o lyrics.md --duration 2.5

  # JSON入力（詳細設定）
  npx ts-node src/generate-slides.ts -j slides.json -o lyrics.md
`);
}

// メイン実行
const { slides, output, options } = parseArgs();
const markdown = generateMarpMarkdown(slides, options);

fs.writeFileSync(output, markdown);
console.log(`✅ 生成完了: ${output}`);
console.log(`📊 スライド数: ${slides.length}`);
