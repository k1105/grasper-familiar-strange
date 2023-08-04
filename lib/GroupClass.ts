import { Keypoint } from "@tensorflow-models/hand-pose-detection";
import { Point } from "./PointClass";
import p5Types from "p5";
import { Handpose } from "../@types/global";

export class Group {
  position: Keypoint;
  rotation: number;
  children: Group[] | Point[];
  origin: Keypoint;
  t: number; //0-1; 0: begin, 1: terminate
  state: "add" | "delete" | "none";
  targetId: number;
  sequence: {
    at: number;
    position: (handpose: Handpose, index: number) => Keypoint;
  }[];
  sequenceHead: number;

  constructor(children: Group[] | Point[]) {
    this.position = { x: 0, y: 0 };
    this.rotation = 0;
    this.children = children;
    this.origin = { x: 0, y: 0 };
    this.t = 1;
    this.state = "none";
    this.targetId = 0;
    this.sequence = [];
    this.sequenceHead = 0;
  }

  show(p5: p5Types) {
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(this.rotation);
    const displayPos: Keypoint[] = [];
    for (const child of this.children) {
      displayPos.push(child.position);
    }

    if (this.t < 1) {
      //特殊なpositionをassignする必要がある
      if (this.state == "delete") {
        if (this.targetId == 0) {
          displayPos[0] = {
            x:
              (this.children[0] as Point).position.x * (1 - this.t) +
              (this.children[1] as Point).position.x * this.t,
            y:
              (this.children[0] as Point).position.y * (1 - this.t) +
              (this.children[1] as Point).position.y * this.t,
          };
          this.origin = displayPos[0];
        } else if (this.targetId == this.children.length - 1) {
          displayPos[this.targetId] = {
            x:
              (this.children[this.targetId] as Point).position.x *
                (1 - this.t) +
              (this.children[this.targetId - 1] as Point).position.x * this.t,
            y:
              (this.children[this.targetId] as Point).position.y *
                (1 - this.t) +
              (this.children[this.targetId - 1] as Point).position.y * this.t,
          };
        } else {
          displayPos[this.targetId] = {
            x:
              (this.children[this.targetId] as Point).position.x *
                (1 - this.t) +
              (((this.children[this.targetId - 1] as Point).position.x +
                (this.children[this.targetId + 1] as Point).position.x) /
                2) *
                this.t,
            y:
              (this.children[this.targetId] as Point).position.y *
                (1 - this.t) +
              (((this.children[this.targetId - 1] as Point).position.y +
                (this.children[this.targetId + 1] as Point).position.y) /
                2) *
                this.t,
          };
        }
      } else if (this.state == "add") {
      }
      this.t += 0.1;
    }
    if (this.t >= 1 && this.state == "delete") {
      this.t = 1;
      //   if (this.targetId == 0 && this.sequence.length > 0) {
      //     const currentPos = this.position;
      //     const originPos = this.origin;
      //     const childPos = this.children[1].position;
      //     this.position = {
      //       x: currentPos.x + childPos.x - originPos.x,
      //       y: currentPos.y + childPos.y - originPos.y,
      //     };
      //   }
      this.children.splice(this.targetId, 1); //要素を削除
      this.state = "none";
    }

    this.children.forEach((child: Group | Point, index) => {
      if ("show" in child) {
        //Groupの場合
        child.show(p5);
      } else {
        //Pointの場合
        p5.strokeWeight(2);
        const cPos = displayPos[index];
        p5.circle(cPos.x - this.origin.x, cPos.y - this.origin.y, 10);
        if (index < this.children.length - 1) {
          const nPos = displayPos[index + 1];
          p5.line(
            cPos.x - this.origin.x,
            cPos.y - this.origin.y,
            nPos.x - this.origin.x,
            nPos.y - this.origin.y
          );
        }
      }
    });
    p5.pop();
  }

  delete(id: number) {
    this.t = 0;
    this.state = "delete";
    this.targetId = id;
  }

  updateOrigin(origin: Keypoint) {
    this.position = origin;
  }
}
