import { FC, useEffect, useRef, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';

import style from './App.module.scss';

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

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasCtx(canvasRef.current.getContext('2d'));
    }
  }, []);

  useEffect(() => {
    tf.ready().then(() => {
      console.log('tfjs ready');
    });
  }, []);

  // set up detector
  useEffect(() => {
    if (canvasCtx) {
      poseDetection
        .createDetector(MODEL, {
          // modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        })
        .then((det) => {
          setDetector(det);
        });
    }
  }, [canvasCtx]);

  // start detection
  useEffect(() => {
    if (detector && videoRef.current && canvasCtx) {
      const detect = async () => {
        console.log('videoRef.current', videoRef.current);
        // TODO: here is the issue
        const poses = await detector.estimatePoses(videoRef.current, {
          maxPoses: 1,
          flipHorizontal: false,
          scoreThreshold: 0.4,
        });

        console.log('poses', JSON.stringify(poses, null, 2));

        // poses.forEach((pose) => {
        //   pose.keypoints.forEach((keypoint) => {
        //     console.log(keypoint);
        //     // const { x, y } = keypoint.position;
        //     // canvasCtx.beginPath();
        //     // canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
        //     // canvasCtx.fillStyle = 'red';
        //     // canvasCtx.fill();
        //   });
        // });

        // requestAnimationFrame(detect);
      };

      detect();
    }
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
        } else {
          str.getTracks().forEach((track) => {
            track.stop();
          });
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error accessing the camera:', err);
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
