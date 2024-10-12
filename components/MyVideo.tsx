import {
  AbsoluteFill,
  useVideoConfig,
  Img,
  Audio,
  continueRender,
  delayRender,
  staticFile,
  interpolate,
  useCurrentFrame,
} from "remotion";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useEffect, useState, useCallback } from "react";
import { VideoCaptions } from "./Caption";
import React from "react";
import { loadFont } from "../lib/load-font";

const TRANSITION_DURATION = 60; // 1 second at 30 fps
const MIN_SEQUENCE_DURATION = TRANSITION_DURATION + 1; // Ensure sequence is longer than transition
const ZOOM_FACTOR = 1.3; // Maximum zoom (1.1 = 110% of original size)

export const MyVideo: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const currentFrame = useCurrentFrame();
  const [images, setImages] = useState<string[]>([]);
  const [handle] = useState(() => delayRender());

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=lord-jesus-christ&orientation=portrait&per_page=5&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const imageUrls = data.results.map((photo: any) => photo.urls.regular);
      await Promise.all(imageUrls.map(preloadImage));
      setImages(imageUrls);
      continueRender(handle);
    } catch (error) {
      console.error("Error fetching images:", error);
      continueRender(handle);
    }
  }, [handle]);

  useEffect(() => {
    loadFont();
    fetchImages();
  }, [fetchImages]);

  if (images.length === 0) {
    return null;
  }

  const totalImages = images.length;
  const totalTransitionFrames = (totalImages - 1) * TRANSITION_DURATION;
  const totalFrames = durationInFrames + totalTransitionFrames;

  // Distribute frames evenly among images, ensuring each gets at least MIN_SEQUENCE_DURATION
  const baseFramesPerImage = Math.max(
    MIN_SEQUENCE_DURATION,
    Math.floor(totalFrames / totalImages)
  );

  // Calculate total frames used by base durations
  const totalBaseFrames = baseFramesPerImage * (totalImages - 1);

  // Assign all remaining frames to the last image
  const lastImageFrames = totalFrames - totalBaseFrames;

  // Calculate the fade-out duration (e.g., last 2 seconds)
  const fadeOutDuration = 2 * fps;
  const fadeOutStart = durationInFrames - fadeOutDuration;

  // Calculate the background music volume
  const bgMusicVolume = interpolate(
    currentFrame,
    [fadeOutStart, durationInFrames],
    [0.1, 0], // Start at 0.1 (10%) and end at 0 (0%)
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill className="bg-black">
      <TransitionSeries>
        {images.map((image, index) => {
          const isLastImage = index === totalImages - 1;
          const sequenceDuration = isLastImage
            ? lastImageFrames
            : baseFramesPerImage;

          return (
            <React.Fragment key={`seq-${index}`}>
              <TransitionSeries.Sequence durationInFrames={sequenceDuration}>
                <ZoomingImage src={image} duration={sequenceDuration} />
              </TransitionSeries.Sequence>
              {!isLastImage && (
                <TransitionSeries.Transition
                  key={`trans-${index}`}
                  timing={
                    index % 2 === 0
                      ? springTiming({ config: { damping: 200 } })
                      : linearTiming({ durationInFrames: TRANSITION_DURATION })
                  }
                  presentation={fade()}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      <Audio src={staticFile("audio/narration.mp3")} />
      <Audio src={staticFile("audio/bg-music.mp3")} volume={bgMusicVolume} />
      <VideoCaptions />
    </AbsoluteFill>
  );
};

interface ZoomingImageProps {
  src: string;
  duration: number;
}

const ZoomingImage: React.FC<ZoomingImageProps> = ({ src, duration }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, duration], [1, ZOOM_FACTOR], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <Img
      src={src}
      className="absolute top-1/2 left-1/2 object-cover"
      style={{
        width: `${100 * zoom}%`,
        height: `${100 * zoom}%`,
        transform: `translate(-50%, -50%)`,
      }}
    />
  );
};

// Helper function to preload images
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};
