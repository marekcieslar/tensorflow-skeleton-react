import { FC, useEffect, useRef } from "react";

import style from "./App.module.scss";
import useDeviceOrientation from "./useDeviceOrientation";
import useBodyAnalysis from "./useBodyAnalysis";

const App: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analysis = useBodyAnalysis({ videoElement: videoRef.current || null });

  const { screenOrientation } = useDeviceOrientation();

  useEffect(() => {
    const constraints: MediaStreamConstraints = {
      video: {
        width: 640,
        height: 360,
      },
    };

    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((str) => {
        if (videoRef.current) {
          stream = str;
          videoRef.current.srcObject = str;
          videoRef.current.width = str.getVideoTracks()[0].getSettings().width!;
          videoRef.current.height = str
            .getVideoTracks()[0]
            .getSettings().height!;

          console.log(str.getVideoTracks()[0].getSettings());
        } else {
          str.getTracks().forEach((track) => {
            track.stop();
          });
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Error accessing the camera:", err);
      });

    return () => {
      if (stream) {
        const tracks = stream?.getTracks() || [];
        tracks.forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <div>
      <video className={style.video} ref={videoRef} autoPlay playsInline muted>
        <track kind="captions" />
      </video>
      <canvas
        className={style.canvas}
        ref={canvasRef}
        width={screenOrientation === "vertical" ? 360 : 640}
        height={screenOrientation === "vertical" ? 640 : 360}
      />
      <pre>{JSON.stringify({ screenOrientation, analysis }, null, 2)}</pre>
    </div>
  );
};

export default App;
