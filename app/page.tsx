"use client";

import { Player } from "@remotion/player";
import { MyVideo } from "@/components/MyVideo";
import { useEffect, useState } from "react";

export default function Home() {
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/narration.mp3");
    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration);
    });
  }, []);

  const fps = 30;
  const durationInFrames = audioDuration ? Math.ceil(audioDuration * fps) : 300;

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm shadow-lg rounded-lg overflow-hidden">
        <Player
          component={MyVideo}
          durationInFrames={durationInFrames}
          compositionWidth={1080}
          compositionHeight={1920}
          fps={fps}
          controls
          style={{
            width: "100%",
            aspectRatio: "9 / 16",
          }}
        />
      </div>
    </div>
  );
}
