import { Keypoint } from "@tensorflow-models/hand-pose-detection";
import { Handpose } from "../@types/global";

export class Node {
  private position: Keypoint;
  positionCurrentRule: (handpose: Handpose, index: number) => Keypoint;
  positionNextRule: (handpose: Handpose, index: number) => Keypoint;
  private transitionProgress: number;
  private transitionBeginAt: number;
  positionSequenceHead: number;
  constructor(position: Keypoint) {
    this.position = position;
    this.positionCurrentRule = (handpose: Handpose, index: number) => {
      return { x: 0, y: 0 };
    };
    this.positionNextRule = (handpose: Handpose, index: number) => {
      return { x: 0, y: 0 };
    };
    this.positionSequenceHead = 0;
    this.transitionProgress = 1; //0-1.
    this.transitionBeginAt = 0;
  }

  getPosition = () => {
    return this.position;
  };

  getTransitionProgress = () => {
    return this.transitionProgress;
  };

  updatePosition = (handpose: Handpose, index: number) => {
    if (this.transitionProgress < 1) {
      const t = this.transitionProgress;
      const currentPos = this.positionCurrentRule(handpose, index);
      const nextPos = this.positionNextRule(handpose, index);
      this.position = {
        x: (1 - t) * currentPos.x + t * nextPos.x,
        y: (1 - t) * currentPos.y + t * nextPos.y,
      };
      this.transitionProgress = Math.min(
        (new Date().getTime() - this.transitionBeginAt) / 1000,
        1
      );
    } else {
      this.positionCurrentRule = this.positionNextRule;
      this.position = this.positionCurrentRule(handpose, index);
    }
  };

  setPositionRule = (rule: (handpose: Handpose, index: number) => Keypoint) => {
    this.positionCurrentRule = rule;
    this.positionNextRule = rule;
  };

  updatePositionRule = (
    rule: (handpose: Handpose, index: number) => Keypoint
  ) => {
    this.transitionProgress = 0;
    this.transitionBeginAt = new Date().getTime();
    this.positionNextRule = rule;
  };
}
