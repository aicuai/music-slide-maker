import React from "react";
import { Composition } from "remotion";
import { LyricVideo, SlideData } from "./LyricVideo";

// PicoPico! Shooting Game 123 - Mina Azure
// BPM: 121, 1beat=0.496s, 1bar=1.983s, first beat=1.606s
// タイミング: aubio beat detection + YouTube自動字幕照合
const fps = 30;
const at = (s: number) => Math.round(s * fps);

const bpm = 121;
const beat = 60.0 / bpm;  // 0.496s
const bar = beat * 4;      // 1.983s
const b1 = 1.606;          // first beat

// 小節番号から秒数
const fromBar = (n: number) => b1 + (n - 1) * bar;

// [開始秒, 終了秒, 歌詞, アニメーション]
const timings: Array<[number, number, string, SlideData["animation"]]> = [
  // === イントロ (小節1-2) ===
  [0.0, fromBar(2), "PicoPico! Shooting Game 123", "scale"],

  // === Verse 1 (小節2-10) ===
  // 字幕4.40s→小節2.4あたりから歌い出し
  [fromBar(2), fromBar(4), "毎日 タスクまみれ", "fade"],
  [fromBar(4), fromBar(6), "多すぎる トゥードゥー\n(Do do do do…)", "fade"],
  // 字幕21.24s→小節10.9 = 小節8あたりから
  [fromBar(6), fromBar(8), "あたまは ぐしゃぐしゃ", "fade"],
  [fromBar(8), fromBar(10), "ハートも ごしゃごしゃ", "fade"],
  [fromBar(10), fromBar(11), "You shoot me too much!", "scale"],

  // === Pre-Chorus 1 (小節11-19) ===
  [fromBar(11), fromBar(13), "Love is live! Love is lose!", "slide"],
  [fromBar(13), fromBar(15), "だから 君を Gekiha!する", "fade"],
  // 字幕28.48s→小節14.6
  [fromBar(15), fromBar(16), "It's just a game", "fade"],
  [fromBar(16), fromBar(17), "It's not for love", "fade"],
  // 字幕34.04s→小節17.4
  [fromBar(17), fromBar(19), "あたしが 勝てばOK!", "scale"],

  // === Chorus (小節19-23) ===
  // 字幕37.72s→小節19.2
  [fromBar(19), fromBar(21), "Pico Pico!\n(Shooting Game!)", "scale"],
  [fromBar(21), fromBar(23), "Pico Pico!\n(Shooting Game!)", "scale"],

  // === Verse 2 (小節23-31) ===
  // 字幕45.48s→小節23.1
  [fromBar(23), fromBar(25), "メッセうって バリバリ", "fade"],
  // 字幕48.36s→小節24.6
  [fromBar(25), fromBar(27), "多すぎる reply\n(Re re re re…)", "fade"],
  // 字幕52.32s→小節26.6
  [fromBar(27), fromBar(29), "あたまは ぐしゃぐしゃ", "fade"],
  [fromBar(29), fromBar(30), "ハートも ごしゃごしゃ", "fade"],
  [fromBar(30), fromBar(31), "I just shoot you too much!", "scale"],

  // === Pre-Chorus 2 (小節31-37) ===
  // 字幕58.28s→小節29.6 → 62.16s→小節31.5
  [fromBar(31), fromBar(33), "Love is live! Love is lose!", "slide"],
  [fromBar(33), fromBar(35), "だから 君を Head shot する", "fade"],
  [fromBar(35), fromBar(36), "It's just a game", "fade"],
  [fromBar(36), fromBar(37), "It's not for love", "fade"],
  // 字幕63.80s→小節32.4
  [fromBar(37), fromBar(39), "あたし 勝てば勝利。", "scale"],

  // === Bridge (小節39-45) ===
  // 字幕72.64s→小節36.8 → 80.32s→小節40.7
  [fromBar(39), fromBar(41), "恋も ルール Mushi で", "fade"],
  [fromBar(41), fromBar(43), "I'm just targeting you", "fade"],
  [fromBar(43), fromBar(44), "でも 悪くない", "fade"],
  [fromBar(44), fromBar(45), "Koroshi はしないから...", "slide"],

  // === Final Section (小節45-53) ===
  // 字幕86.80s→小節44.0
  [fromBar(45), fromBar(47), "Love is live! Love is lose!", "scale"],
  // 字幕91.24s→小節46.2
  [fromBar(47), fromBar(48), "でも まだ止まれない!!", "scale"],
  [fromBar(48), fromBar(49), "I'm just stunning you much…", "fade"],
  [fromBar(49), fromBar(50), "Not for love / Not for me", "fade"],
  [fromBar(50), fromBar(51), "まだ生きているから", "slide"],
  [fromBar(51), fromBar(52), "恋は 生きてる 恋は 壊れる", "fade"],
  // 字幕93.80s→小節47.5
  [fromBar(52), fromBar(53), "だから Utsuyo...!", "scale"],

  // === Outro ===
  [fromBar(53), 105.0, "✨ PicoPico! Shooting Game 123 ✨", "scale"],
];

const ppsgSlides: SlideData[] = timings.map(([start, end, text, animation]) => ({
  text,
  startFrame: at(start),
  durationInFrames: at(end - start),
  animation,
}));

const totalFrames = Math.max(
  ppsgSlides.reduce((max, s) => Math.max(max, s.startFrame + s.durationInFrames), 0),
  at(105)
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LyricVideo"
        component={LyricVideo}
        durationInFrames={totalFrames}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={{
          slides: ppsgSlides,
          audioSrc: "ppsg123.mp3",
          backgroundColor: "#000000",
          textColor: "#ff1a1a",
          fontSize: 64,
          fontFamily: "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', sans-serif",
          defaultAnimation: "fade",
        }}
      />

      <Composition
        id="LyricVideoPreview"
        component={LyricVideo}
        durationInFrames={at(20)}
        fps={fps}
        width={1280}
        height={720}
        defaultProps={{
          slides: ppsgSlides.slice(0, 6),
          audioSrc: "ppsg123.mp3",
          backgroundColor: "#000000",
          textColor: "#ff1a1a",
          fontSize: 56,
          fontFamily: "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', sans-serif",
          defaultAnimation: "fade",
        }}
      />
    </>
  );
};
