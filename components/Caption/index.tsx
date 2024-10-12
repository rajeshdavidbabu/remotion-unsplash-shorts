import React from "react";
import { Caption } from "@remotion/captions";
import captionsData from "../../public/audio/captions.json";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import Subtitle from "./Subtitle";

// Convert the captions data to the format expected by createTikTokStyleCaptions
const convertCaptions = (data: typeof captionsData): Caption[] => {
  return data.results.channels[0].alternatives[0].words.map((word) => ({
    text: word.punctuated_word,
    startMs: word.start * 1000,
    endMs: word.end * 1000,
    timestampMs: null,
    confidence: null,
  }));
};

interface CombinedToken {
  text: string;
  startMs: number;
  endMs: number;
}

const combineTokens = (
  captions: Caption[],
  maxGapMs: number,
  maxWords: number = 7 // New parameter with a default value
): CombinedToken[] => {
  const combinedTokens: CombinedToken[] = [];
  let currentToken: CombinedToken | null = null;
  let wordCount = 0;

  for (const caption of captions) {
    if (
      !currentToken ||
      wordCount >= maxWords ||
      caption.startMs - currentToken.endMs > maxGapMs
    ) {
      if (currentToken) {
        combinedTokens.push(currentToken);
      }
      currentToken = { ...caption, text: caption.text };
      wordCount = 1;
    } else {
      currentToken.text += " " + caption.text;
      currentToken.endMs = caption.endMs;
      wordCount++;
    }
  }

  if (currentToken) {
    combinedTokens.push(currentToken);
  }

  return combinedTokens;
};

export const VideoCaptions: React.FC = () => {
  const { fps } = useVideoConfig();

  const captions = convertCaptions(captionsData);
  const combinedTokens = combineTokens(captions, 100); // Combine tokens with gaps <= 100ms

  return (
    <AbsoluteFill>
      {combinedTokens.map((token, index) => {
        const nextToken = combinedTokens[index + 1] ?? null;
        const tokenStartFrame = Math.round((token.startMs / 1000) * fps);
        const tokenEndFrame = Math.round(
          Math.min(
            nextToken ? (nextToken.startMs / 1000) * fps : Infinity,
            (token.endMs / 1000) * fps
          )
        );
        const durationInFrames = tokenEndFrame - tokenStartFrame;

        if (durationInFrames <= 0) {
          console.warn(`Token ${index} has invalid duration:`, token);
          return null;
        }

        return (
          <Sequence
            key={index}
            from={tokenStartFrame}
            durationInFrames={durationInFrames}
          >
            <Subtitle text={token.text} alignment="bottom" />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
