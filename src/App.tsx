import { FC, useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgpu";

import style from "./App.module.scss";

const MODEL = poseDetection.SupportedModels.MoveNet;

const drawPoints = (
  keypoints: poseDetection.Keypoint[],
  canvas: CanvasRenderingContext2D
) => {
  keypoints.forEach((keypoint) => {
    const { x, y, score } = keypoint;

    if (!score || score < 0.2) {
      return;
    }

    canvas.beginPath();
    canvas.arc(x, y, 5, 0, 2 * Math.PI);
    canvas.fillStyle = "pink";
    canvas.fill();
  });
};

const drawLine = (
  p1: poseDetection.Keypoint,
  p2: poseDetection.Keypoint,
  canvas: CanvasRenderingContext2D
) => {
  if (!p1.score || !p2.score || p1.score < 0.2 || p2.score < 0.2) {
    return;
  }

  canvas.beginPath();
  canvas.moveTo(p1.x, p1.y);
  canvas.lineTo(p2.x, p2.y);
  canvas.strokeStyle = "red";
  canvas.stroke();
};

const draw17Lines = (
  keypoints: poseDetection.Keypoint[],
  canvas: CanvasRenderingContext2D
) => {
  drawLine(keypoints[5], keypoints[6], canvas);
  drawLine(keypoints[0], keypoints[1], canvas);
  drawLine(keypoints[0], keypoints[2], canvas);
  drawLine(keypoints[1], keypoints[3], canvas);
  drawLine(keypoints[2], keypoints[4], canvas);
  drawLine(keypoints[5], keypoints[7], canvas);
  drawLine(keypoints[7], keypoints[9], canvas);
  drawLine(keypoints[6], keypoints[8], canvas);
  drawLine(keypoints[8], keypoints[10], canvas);
  drawLine(keypoints[5], keypoints[11], canvas);
  drawLine(keypoints[6], keypoints[12], canvas);
  drawLine(keypoints[11], keypoints[12], canvas);
  drawLine(keypoints[11], keypoints[13], canvas);
  drawLine(keypoints[13], keypoints[15], canvas);
  drawLine(keypoints[12], keypoints[14], canvas);
  drawLine(keypoints[14], keypoints[16], canvas);
};

const App: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>(
    null
  );
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(
    null
  );

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

        canvasCtx.clearRect(
          0,
          0,
          videoRef.current!.width,
          videoRef.current!.height
        );

        draw17Lines(poses[0].keypoints, canvasCtx);
        drawPoints(poses[0].keypoints, canvasCtx);
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
      video: true,
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
      <video className={style.video} ref={videoRef} autoPlay playsInline>
        <track kind="captions" />
      </video>
      <canvas
        className={style.canvas}
        ref={canvasRef}
        width="640"
        height="480"
      />
    </div>
  );
};

export default App;
