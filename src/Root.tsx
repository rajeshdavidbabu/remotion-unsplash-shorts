import { Composition } from "remotion";
import { MyVideo } from "../components/MyVideo";
import "./style.css";

export const RemotionRoot: React.FC = () => {
  const fps = 60;

  return (
    <Composition
      id="MyComposition"
      durationInFrames={3476}
      width={1080}
      height={1920}
      fps={fps}
      component={MyVideo}
    />
  );
};
