import { Keypoint } from "@tensorflow-models/hand-pose-detection";
import { Node } from "./NodeClass";
export class Point extends Node {
  id: number;
  constructor(position: Keypoint, id: number) {
    super(position);
    this.id = id;
  }
}
