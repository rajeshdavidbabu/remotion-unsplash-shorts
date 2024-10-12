import React from "react";
import {
  createTikTokStyleCaptions,
  Caption,
  TikTokPage,
  TikTokToken,
} from "@remotion/captions";
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

export const VideoCaptions: React.FC = () => {
  const { fps } = useVideoConfig();

  const captions = convertCaptions(captionsData);
  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: 1000,
  });

  const allTokens = pages.flatMap((page) => page.tokens);

  return (
    <AbsoluteFill>
      {allTokens.map((token, index) => {
        const nextToken = allTokens[index + 1] ?? null;
        const tokenStartFrame = (token.fromMs / 1000) * fps;
        const tokenEndFrame = Math.min(
          nextToken ? (nextToken.fromMs / 1000) * fps : Infinity,
          (token.toMs / 1000) * fps
        );
        const durationInFrames = tokenEndFrame - tokenStartFrame;
        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={tokenStartFrame}
            durationInFrames={durationInFrames}
          >
            <Subtitle text={token.text} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
