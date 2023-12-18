import * as poseDetection from "@tensorflow-models/pose-detection";
import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgpu";
import { MODEL, TStatus, VISIBILITY_THRESHOLD, analyzeStatus } from "./analyze";

interface IUseBodyAnalysis {
  videoElement: HTMLVideoElement | null;
  frames?: number;
}

const useBodyAnalysis = ({ videoElement, frames = 3 }: IUseBodyAnalysis) => {
  const [isOn, setIsOn] = useState<boolean>(false);
  const [status, setStatus] = useState<TStatus>("no");
  const [feedback, setFeedback] = useState<string>("");
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(
    null
  );
  const [isReady, setIsReady] = useState<boolean>(false);
  const [keypoints, setKeypoints] = useState<poseDetection.Keypoint[] | null>(
    null
  );
  const [pointsVisible, setPointsVisible] = useState<number>(0);

  // setup
  useEffect(() => {
    tf.ready().then(() => {
      console.log("tfjs ready");
      setIsReady(true);
    });
  }, []);

  // set up detector
  useEffect(() => {
    if (isReady) {
      poseDetection
        .createDetector(MODEL, {
          minPoseScore: VISIBILITY_THRESHOLD,
        } as poseDetection.MoveNetModelConfig)
        .then((det) => {
          setDetector(det);
        })
        .catch(() => {
          setDetector(null);
        });
    }

    return () => {
      setDetector(null);
    };
  }, [isReady]);

  // start detection loop
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (detector && videoElement && frames > 0 && isReady) {
      const detect = async () => {
        const poses = await detector.estimatePoses(videoElement, {
          maxPoses: 1,
          flipHorizontal: false,
          scoreThreshold: VISIBILITY_THRESHOLD,
        });

        setKeypoints(poses?.[0]?.keypoints || []);

        setPointsVisible(
          poses?.[0]?.keypoints?.filter((keypoint) => {
            return keypoint.score && keypoint.score > VISIBILITY_THRESHOLD;
          }).length || 0
        );

        setIsOn(true);
        setFeedback("You're doing great!");
        setStatus(
          analyzeStatus(
            poses?.[0]?.keypoints || [],
            videoElement.width,
            videoElement.height
          )
        );
      };

      interval = setInterval(() => {
        detect();
      }, 1_000 / frames);
    }

    return () => {
      clearInterval(interval);
    };
  }, [detector, videoElement, frames, isReady]);

  return {
    isOn,
    status,
    feedback,
    pointsVisible,
    keypoints,
  };
};

export default useBodyAnalysis;
