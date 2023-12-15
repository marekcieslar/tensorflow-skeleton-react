import { FC, useEffect, useRef, useState } from 'react';

import style from './App.module.scss';

const App: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>(
    null
  );

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasCtx(canvasRef.current.getContext('2d'));
    }
  }, []);

  if (canvasCtx) {
    // draw a red rectangle
    canvasCtx.fillStyle = 'rgb(200, 0, 0)';
    canvasCtx.fillRect(10, 10, 50, 50);
  }

  console.log('canvasCtx', canvasCtx);

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
