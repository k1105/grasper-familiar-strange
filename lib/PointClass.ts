import { Keypoint } from "@tensorflow-models/hand-pose-detection";
export class Point {
  position: Keypoint;
  constructor(position: Keypoint) {
    this.position = position;
  }
}
