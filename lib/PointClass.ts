import { Keypoint } from "@tensorflow-models/hand-pose-detection";
import { Node } from "./NodeClass";
export class Point extends Node {
  id: number;
  radius: number;
  constructor(position: Keypoint, id: number) {
    super(position);
    this.id = id;
    this.radius = 10;
  }

  updateRadius = () => {
    const t = this.getTransitionProgress();

    this.radius = 10 * (1 - t);
  };
}
