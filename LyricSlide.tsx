import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
} from "remotion";

export interface LyricSlideProps {
  text: string;
  html?: string;
  css?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  animation?: "fade" | "slide" | "scale" | "typewriter" | "none";
}

export const LyricSlide: React.FC<LyricSlideProps> = ({
  text,
  html,
  css,
  backgroundColor = "#000000",
  textColor = "#ffffff",
  fontSize = 72,
  fontFamily = "'Noto Sans JP', sans-serif",
  animation = "fade",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // アニメーション計算
  const getAnimationStyle = (): React.CSSProperties => {
    const fadeInDuration = fps * 0.3; // 0.3秒でフェードイン
    const fadeOutStart = durationInFrames - fps * 0.3;

    switch (animation) {
      case "fade": {
        const opacity = interpolate(
          frame,
          [0, fadeInDuration, fadeOutStart, durationInFrames],
          [0, 1, 1, 0],
          { extrapolateRight: "clamp" }
        );
        return { opacity };
      }

      case "slide": {
        const progress = spring({
          frame,
          fps,
          config: { damping: 20, stiffness: 100 },
        });
        const exitProgress = interpolate(
          frame,
          [fadeOutStart, durationInFrames],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const translateY = interpolate(progress, [0, 1], [50, 0]);
        const exitTranslateY = interpolate(exitProgress, [0, 1], [0, -50]);
        const opacity = interpolate(
          frame,
          [0, fadeInDuration / 2, fadeOutStart, durationInFrames],
          [0, 1, 1, 0],
          { extrapolateRight: "clamp" }
        );
        return {
          transform: `translateY(${translateY + exitTranslateY}px)`,
          opacity,
        };
      }

      case "scale": {
        const scaleIn = spring({
          frame,
          fps,
          config: { damping: 15, stiffness: 150 },
        });
        const opacity = interpolate(
          frame,
          [0, fadeInDuration / 2, fadeOutStart, durationInFrames],
          [0, 1, 1, 0],
          { extrapolateRight: "clamp" }
        );
        const scale = interpolate(scaleIn, [0, 1], [0.8, 1]);
        return {
          transform: `scale(${scale})`,
          opacity,
        };
      }

      case "typewriter": {
        const charsToShow = Math.floor(
          interpolate(frame, [0, durationInFrames * 0.6], [0, text.length], {
            extrapolateRight: "clamp",
          })
        );
        const fadeOutOpacity = interpolate(
          frame,
          [fadeOutStart, durationInFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return {
          opacity: fadeOutOpacity,
          // typewriterは特殊処理が必要なのでtextを上書き
        };
      }

      case "none":
      default:
        return {};
    }
  };

  const displayText =
    animation === "typewriter"
      ? text.slice(
          0,
          Math.floor(
            interpolate(frame, [0, durationInFrames * 0.6], [0, text.length], {
              extrapolateRight: "clamp",
            })
          )
        )
      : text;

  const animStyle = getAnimationStyle();

  // カスタムHTMLを使用する場合
  if (html && css) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          ...animStyle,
        }}
      >
        <style>{css}</style>
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </AbsoluteFill>
    );
  }

  // シンプルなテキスト表示
  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        ...animStyle,
      }}
    >
      <div
        style={{
          color: textColor,
          fontSize,
          fontFamily,
          fontWeight: "bold",
          textAlign: "center",
          padding: "0 10%",
          paddingBottom: "8%",
          lineHeight: 1.4,
          WebkitTextStroke: "3px white",
          paintOrder: "stroke fill",
          textShadow: "0 4px 20px rgba(0,0,0,0.7)",
        }}
      >
        {displayText}
      </div>
    </AbsoluteFill>
  );
};
