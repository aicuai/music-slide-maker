import { Marp } from "@marp-team/marp-core";

export interface ParsedSlide {
  index: number;
  html: string;
  css: string;
  text: string; // プレーンテキスト（歌詞）
  duration?: number; // 秒単位のデュレーション
  animation?: "fade" | "slide" | "scale" | "typewriter" | "none";
}

export interface MarpParseResult {
  slides: ParsedSlide[];
  css: string;
  totalDuration: number;
}

/**
 * Marp Markdownをパースしてスライド情報を抽出
 * 
 * Markdownフォーマット:
 * ---
 * marp: true
 * ---
 * 
 * <!-- duration: 3 -->
 * # 歌詞1行目
 * 
 * ---
 * 
 * <!-- duration: 2.5 -->
 * # 歌詞2行目
 */
export function parseMarpMarkdown(markdown: string): MarpParseResult {
  const marp = new Marp({
    html: true,
    emoji: {
      shortcode: true,
      unicode: true,
    },
  });

  const { html, css } = marp.render(markdown);

  // HTMLからスライドを抽出
  const slideMatches = html.match(/<section[^>]*>[\s\S]*?<\/section>/g) || [];
  
  // Markdownからdurationコメントを抽出
  const parts = markdown.split(/^---$/m);
  const durationMap: Map<number, number> = new Map();
  const animationMap: Map<number, string> = new Map();

  let slideIndex = 0;
  for (const part of parts) {
    const durationMatch = part.match(/<!--\s*duration:\s*([\d.]+)(?:\s*,\s*animation:\s*(\w+))?\s*-->/);
    if (durationMatch) {
      durationMap.set(slideIndex, parseFloat(durationMatch[1]));
      if (durationMatch[2]) {
        animationMap.set(slideIndex, durationMatch[2]);
      }
    }
    // frontmatter以外の部分をカウント
    if (!part.includes("marp:") && part.trim()) {
      slideIndex++;
    }
  }

  const slides: ParsedSlide[] = slideMatches.map((slideHtml, index) => {
    // HTMLタグを除去してプレーンテキストを取得
    const text = slideHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      index,
      html: slideHtml,
      css,
      text,
      duration: durationMap.get(index) ?? 3, // デフォルト3秒
      animation: animationMap.get(index) as ParsedSlide["animation"],
    };
  });

  const totalDuration = slides.reduce((sum, s) => sum + (s.duration || 3), 0);

  return { slides, css, totalDuration };
}

/**
 * スライド情報からRemotionで使用するシーケンスデータを生成
 */
export function generateSequenceData(
  result: MarpParseResult,
  fps: number = 30
): { slides: Array<ParsedSlide & { startFrame: number; durationInFrames: number }> } {
  let currentFrame = 0;
  
  const sequencedSlides = result.slides.map((slide) => {
    const durationInFrames = Math.round((slide.duration || 3) * fps);
    const startFrame = currentFrame;
    currentFrame += durationInFrames;
    
    return {
      ...slide,
      startFrame,
      durationInFrames,
    };
  });

  return { slides: sequencedSlides };
}
