import * as poseDetection from "@tensorflow-models/pose-detection";

export const drawPoints = (
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
  canvas.strokeStyle = "blue";
  canvas.stroke();
};

export const draw17Lines = (
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
