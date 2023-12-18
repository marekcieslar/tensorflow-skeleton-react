import * as poseDetection from "@tensorflow-models/pose-detection";

export const MODEL = poseDetection.SupportedModels.MoveNet;
export const VISIBILITY_THRESHOLD = 0.5;

export type TStatus = "no" | "partial" | "full";

export const analyzeStatus = (
  keypoints: poseDetection.Keypoint[],
  width: number,
  height: number
): TStatus => {
  const pointsVisible = keypoints.filter(
    (keypoint) => keypoint.score && keypoint.score > VISIBILITY_THRESHOLD
  );
  const pointsVisibleCount = pointsVisible.length;

  if (!width || !height) {
    return "no";
  }

  if (pointsVisibleCount < 5) {
    return "no";
  }

  if (pointsVisibleCount < 13) {
    return "partial";
  }

  return "full";
};
