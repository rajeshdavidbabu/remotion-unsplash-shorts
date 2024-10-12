import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { TheBoldFont } from "../../lib/load-font";
import { makeTransform, scale, translateY } from "@remotion/animation-utils";

const fontFamily = TheBoldFont;
const fixedFontSize = 100; // We'll keep this for the custom fontSize

export const Word: React.FC<{
  enterProgress: number;
  text: string;
  stroke: boolean;
}> = ({ enterProgress, text, stroke }) => {
  const { width } = useVideoConfig();

  const transformStyle = makeTransform([
    scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
    translateY(interpolate(enterProgress, [0, 1], [50, 0])),
  ]);

  return (
    <AbsoluteFill
      className="flex justify-center items-center h-full"
      // style={{ top: undefined, bottom: 600 }} --> is for moving the caption up
      // style={{ top: 600 }} --> is for moving the caption down
    >
      <div
        className={`
          text-white uppercase text-center break-words
          max-w-[80%] font-bold
        `}
        style={{
          fontFamily,
          transform: transformStyle,
          fontSize: fixedFontSize,
          WebkitTextStroke: stroke ? "20px black" : "none",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
