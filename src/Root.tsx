import { Composition, staticFile } from "remotion";
import { MyVideo } from "../components/MyVideo";
import { useState, useEffect } from "react";

export const RemotionRoot: React.FC = () => {
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  useEffect(() => {
    const audio = new Audio(staticFile("/audio/narration.mp3"));
    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration);
    });
  }, []);

  const fps = 30;
  const durationInFrames = audioDuration ? Math.ceil(audioDuration * fps) : 300;

  return (
    <Composition
      id="MyComposition"
      durationInFrames={1738}
      width={1080}
      height={1920}
      fps={fps}
      component={MyVideo}
    />
  );
};
