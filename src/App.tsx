import { FC, useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgpu";

import style from "./App.module.scss";
import { draw17Lines, drawPoints } from "./draw";
import useDeviceOrientation from "./useDeviceOrientation";

const MODEL = poseDetection.SupportedModels.MoveNet;

const App: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>(
    null
  );
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(
    null
  );

  const { screenOrientation } = useDeviceOrientation();

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasCtx(canvasRef.current.getContext("2d"));
    }
  }, []);

  useEffect(() => {
    tf.ready().then(() => {
      console.log("tfjs ready");
    });
  }, []);

  // set up detector
  useEffect(() => {
    if (canvasCtx) {
      poseDetection
        .createDetector(MODEL, {
          // modelType: "light",
          minPoseScore: 0.4,
        } as poseDetection.MoveNetModelConfig)
        .then((det) => {
          setDetector(det);
        });
    }
  }, [canvasCtx]);

  // start detection loop
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (detector && videoRef.current && canvasCtx) {
      const detect = async () => {
        const poses = await detector.estimatePoses(videoRef.current!, {
          maxPoses: 1,
          flipHorizontal: false,
          scoreThreshold: 0.7,
        });

        canvasCtx.clearRect(0, 0, 640, 640);

        if (poses?.[0]?.keypoints) {
          draw17Lines(poses[0].keypoints, canvasCtx);
          drawPoints(poses[0].keypoints, canvasCtx);
        }
      };

      interval = setInterval(() => {
        detect();
      }, 1_000 / 3);
    }

    return () => {
      clearInterval(interval);
    };
  }, [detector, videoRef, canvasCtx]);

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
      <pre>{JSON.stringify({ screenOrientation }, null, 2)}</pre>
    </div>
  );
};

export default App;
