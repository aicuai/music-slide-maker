#!/usr/bin/env node
/**
 * タイムスタンプ付き歌詞ファイル → Marp Markdown 変換
 * 
 * 対応フォーマット:
 *   - SRT (SubRip)
 *   - LRC (歌詞ファイル)
 *   - Whisper JSON
 * 
 * 使い方:
 *   npx ts-node src/import-lyrics.ts -i subtitles.srt -o lyrics.md
 *   npx ts-node src/import-lyrics.ts -i lyrics.lrc -o lyrics.md
 *   npx ts-node src/import-lyrics.ts -i whisper.json -o lyrics.md
 */

import * as fs from "fs";
import * as path from "path";

interface TimedLine {
  text: string;
  startTime: number; // 秒
  endTime: number;   // 秒
}

/**
 * SRTファイルをパース
 */
function parseSRT(content: string): TimedLine[] {
  const blocks = content.trim().split(/\n\n+/);
  const lines: TimedLine[] = [];

  for (const block of blocks) {
    const blockLines = block.split("\n");
    if (blockLines.length < 3) continue;

    // タイムスタンプ行: "00:00:01,000 --> 00:00:04,000"
    const timeMatch = blockLines[1].match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
    );
    if (!timeMatch) continue;

    const startTime =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;

    const endTime =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;

    // テキスト（複数行結合）
    const text = blockLines.slice(2).join(" ").trim();

    lines.push({ text, startTime, endTime });
  }

  return lines;
}

/**
 * LRCファイルをパース
 */
function parseLRC(content: string): TimedLine[] {
  const lines: TimedLine[] = [];
  const lineRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
  
  let match;
  const rawLines: { time: number; text: string }[] = [];

  while ((match = lineRegex.exec(content)) !== null) {
    const time =
      parseInt(match[1]) * 60 +
      parseInt(match[2]) +
      parseInt(match[3].padEnd(3, "0")) / 1000;
    const text = match[4].trim();
    
    if (text) {
      rawLines.push({ time, text });
    }
  }

  // 終了時間を次の開始時間から計算
  for (let i = 0; i < rawLines.length; i++) {
    const startTime = rawLines[i].time;
    const endTime = rawLines[i + 1]?.time ?? startTime + 3;
    
    lines.push({
      text: rawLines[i].text,
      startTime,
      endTime,
    });
  }

  return lines;
}

/**
 * Whisper JSONをパース
 */
function parseWhisperJSON(content: string): TimedLine[] {
  const data = JSON.parse(content);
  const lines: TimedLine[] = [];

  // Whisper出力形式に対応
  const segments = data.segments || data;

  for (const seg of segments) {
    lines.push({
      text: (seg.text || seg.word || "").trim(),
      startTime: seg.start,
      endTime: seg.end,
    });
  }

  return lines;
}

/**
 * TimedLine配列からMarp Markdownを生成
 */
function generateMarpFromTimed(
  lines: TimedLine[],
  options: { theme?: string; minDuration?: number } = {}
): string {
  const { theme = "default", minDuration = 0.5 } = options;

  const frontmatter = `---
marp: true
theme: ${theme}
paginate: false
---
`;

  const slides = lines
    .filter((line) => line.text.trim())
    .map((line, index) => {
      let duration = line.endTime - line.startTime;
      if (duration < minDuration) duration = minDuration;
      
      const separator = index === 0 ? "" : "\n---\n";
      
      return `${separator}
<!-- duration: ${duration.toFixed(2)} -->
<!-- start: ${line.startTime.toFixed(2)} -->
${line.text}
`;
    })
    .join("");

  return frontmatter + slides;
}

/**
 * ファイル形式を検出
 */
function detectFormat(filePath: string, content: string): "srt" | "lrc" | "json" {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === ".srt") return "srt";
  if (ext === ".lrc") return "lrc";
  if (ext === ".json") return "json";
  
  // 内容から推測
  if (content.includes("-->")) return "srt";
  if (content.match(/\[\d{2}:\d{2}\.\d{2,3}\]/)) return "lrc";
  if (content.trim().startsWith("{") || content.trim().startsWith("[")) return "json";
  
  throw new Error("ファイル形式を特定できません。.srt, .lrc, .jsonを使用してください。");
}

// CLI
function parseArgs(): { input: string; output: string; options: { theme?: string; minDuration?: number } } {
  const args = process.argv.slice(2);
  let input = "";
  let output = "output.md";
  const options: { theme?: string; minDuration?: number } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "-i":
      case "--input":
        input = next;
        i++;
        break;
      case "-o":
      case "--output":
        output = next;
        i++;
        break;
      case "--theme":
        options.theme = next;
        i++;
        break;
      case "--min-duration":
        options.minDuration = parseFloat(next);
        i++;
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
    }
  }

  if (!input) {
    console.error("❌ 入力ファイルを指定してください");
    printHelp();
    process.exit(1);
  }

  return { input, output, options };
}

function printHelp(): void {
  console.log(`
🎬 タイムスタンプ付き歌詞 → Marp 変換

Usage:
  npx ts-node src/import-lyrics.ts -i <file> -o <output.md>

対応フォーマット:
  - SRT (SubRip字幕)
  - LRC (歌詞ファイル)
  - Whisper JSON (音声認識出力)

オプション:
  -i, --input <file>      入力ファイル（必須）
  -o, --output <file>     出力Markdownファイル（デフォルト: output.md）
  --theme <name>          Marpテーマ（default, gaia, uncover）
  --min-duration <sec>    最小表示時間（デフォルト: 0.5秒）
  -h, --help              ヘルプ表示

例:
  npx ts-node src/import-lyrics.ts -i subtitles.srt -o lyrics.md
  npx ts-node src/import-lyrics.ts -i karaoke.lrc -o lyrics.md --theme gaia
  npx ts-node src/import-lyrics.ts -i whisper_output.json -o lyrics.md
`);
}

// メイン実行
const { input, output, options } = parseArgs();
const content = fs.readFileSync(input, "utf-8");
const format = detectFormat(input, content);

console.log(`📄 フォーマット検出: ${format.toUpperCase()}`);

let lines: TimedLine[];
switch (format) {
  case "srt":
    lines = parseSRT(content);
    break;
  case "lrc":
    lines = parseLRC(content);
    break;
  case "json":
    lines = parseWhisperJSON(content);
    break;
}

console.log(`📊 ${lines.length}行を検出`);

const markdown = generateMarpFromTimed(lines, options);
fs.writeFileSync(output, markdown);

console.log(`✅ 変換完了: ${output}`);

// 統計情報
const totalDuration = lines.reduce((sum, l) => sum + (l.endTime - l.startTime), 0);
console.log(`⏱️  総再生時間: ${totalDuration.toFixed(1)}秒`);
