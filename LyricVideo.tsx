import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { LyricSlide, LyricSlideProps } from "./LyricSlide";

export interface SlideData {
  text: string;
  html?: string;
  css?: string;
  startFrame: number;
  durationInFrames: number;
  animation?: LyricSlideProps["animation"];
}

export interface LyricVideoProps {
  slides?: SlideData[];
  audioSrc?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  defaultAnimation?: LyricSlideProps["animation"];
}

export const LyricVideo: React.FC<LyricVideoProps> = ({
  slides = [],
  audioSrc,
  backgroundColor = "#1a1a2e",
  textColor = "#ffffff",
  fontSize = 64,
  fontFamily = "'Noto Sans JP', 'Hiragino Sans', sans-serif",
  defaultAnimation = "fade",
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* 背景グラデーション */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${backgroundColor} 0%, #000000 100%)`,
        }}
      />

      {/* 歌詞スライド */}
      {slides.map((slide, index) => (
        <Sequence
          key={index}
          from={slide.startFrame}
          durationInFrames={slide.durationInFrames}
          name={`Slide ${index + 1}: ${slide.text.slice(0, 20)}...`}
        >
          <LyricSlide
            text={slide.text}
            html={slide.html}
            css={slide.css}
            backgroundColor="transparent"
            textColor={textColor}
            fontSize={fontSize}
            fontFamily={fontFamily}
            animation={slide.animation || defaultAnimation}
          />
        </Sequence>
      ))}

      {/* オーディオ */}
      {audioSrc && <Audio src={staticFile(audioSrc)} />}
    </AbsoluteFill>
  );
};
