import dynamic from "next/dynamic";
import p5Types from "p5";
import { MutableRefObject, RefObject, useRef } from "react";
import { Hand } from "@tensorflow-models/hand-pose-detection";
import { getSmoothedHandpose } from "../lib/getSmoothedHandpose";
import { convertHandToHandpose } from "../lib/converter/convertHandToHandpose";
import { isFront } from "../lib/detector/isFront";
import { Monitor } from "../components/Monitor";
import { Handpose } from "../@types/global";
import { DisplayHands } from "../lib/DisplayHandsClass";
import { HandposeHistory } from "../lib/HandposeHitsoryClass";
import { Point } from "../lib/PointClass";
import { Group } from "../lib/GroupClass";
import { animationSequence } from "../components/animationSequence";
import { resizeHandpose } from "../lib/converter/resizeHandpose";

type Props = {
  handpose: MutableRefObject<Hand[]>;
  isLost: RefObject<boolean>;
};
const Sketch = dynamic(import("react-p5"), {
  loading: () => <></>,
  ssr: false,
});

export const HandSketch = ({ handpose, isLost }: Props) => {
  const handposeHistory = new HandposeHistory();
  const displayHands = new DisplayHands();
  const gainRef = useRef<number>(2);
  const scene01FinishRef = useRef<Boolean>(true);

  const debugLog = useRef<{ label: string; value: any }[]>([]);

  const timeList: number[] = [];
  for (let i = 0; i < 20; i++) {
    timeList.push((i + 1) * 5000);
  }

  const leftFingers: Group[] = [];
  for (let i = 0; i < 5; i++) {
    const points: Point[] = [];
    for (let j = 0; j < 5; j++) {
      if (j == 0) {
        points.push(new Point(0, { x: 0, y: 0 }, true, 0));
      } else {
        points.push(new Point(4 * i + j, { x: 0, y: 0 }, true, 4 * i + j));
      }
    }
    points.push(new Point(20 + i, { x: 0, y: 0 }, false, 4 * i + 1));
    points[5].setPosRule((handpose: Handpose, currentPoint: number) => {
      const r = 40;
      const dist = Math.min(
        2 * r,
        Math.max(handpose[currentPoint].y - handpose[currentPoint + 3].y, 0)
      );
      return {
        x: handpose[currentPoint].x - Math.sqrt(r ** 2 - (dist / 2) ** 2),
        y: -dist / 2 + handpose[currentPoint].y,
      };
    });
    points.push(new Point(25 + i, { x: 0, y: 0 }, false, 4 * i + 1));
    points[6].setPosRule((handpose: Handpose, currentPoint: number) => {
      const r = 40;
      const dist = Math.min(
        2 * r,
        Math.max(handpose[currentPoint].y - handpose[currentPoint + 3].y, 0)
      );
      return {
        x: handpose[currentPoint].x,
        y: -dist + handpose[currentPoint].y,
      };
    });
    leftFingers.push(new Group(i, points));
    leftFingers[i].setPositionSequence([
      () => {
        return {
          x: window.innerWidth / 2 - 300,
          y: window.innerHeight / 2 + 150,
        };
      },
      (handpose: Handpose, groupId: number) => {
        return {
          x: window.innerWidth / 2 + 200 * (groupId - 2) - 30,
          y: window.innerHeight / 2 + 150,
        };
      },
      (handpose: Handpose, groupId: number) => {
        if (groupId > 0) {
          let resY = 0;
          for (let i = 1; i <= groupId; i++) {
            resY -= Math.min(
              Math.max(
                handpose[4 * (i - 1) + 1].y - handpose[4 * (i - 1) + 4].y,
                0
              ),
              80
            );
          }
          return {
            x: window.innerWidth / 2 - 50,
            y: window.innerHeight / 2 + 150 + resY,
          };
        } else {
          return {
            x: window.innerWidth / 2 - 50,
            y: window.innerHeight / 2 + 150,
          };
        }
      },
    ]);
  }
  // const leftHand = new Group(leftFingers);

  const rightFingers: Group[] = [];
  for (let i = 0; i < 5; i++) {
    const points: Point[] = [];
    for (let j = 0; j < 5; j++) {
      if (j == 0) {
        points.push(new Point(0, { x: 0, y: 0 }, true, 0));
      } else {
        points.push(new Point(4 * i + j, { x: 0, y: 0 }, true, 4 * i + j));
      }
    }
    points.push(new Point(20 + i, { x: 0, y: 0 }, false, 4 * i + 1));
    points[5].setPosRule((handpose: Handpose, currentPoint: number) => {
      const r = 40;
      const dist = Math.min(
        2 * r,
        Math.max(handpose[currentPoint].y - handpose[currentPoint + 3].y, 0)
      );
      points.push(new Point(25 + i, { x: 0, y: 0 }, false, 4 * i + 1));
      points[6].setPosRule((handpose: Handpose, currentPoint: number) => {
        const r = 40;
        const dist = Math.min(
          2 * r,
          Math.max(handpose[currentPoint].y - handpose[currentPoint + 3].y, 0)
        );
        return {
          x: handpose[currentPoint].x,
          y: -dist + handpose[currentPoint].y,
        };
      });
      return {
        x: handpose[currentPoint].x + Math.sqrt(r ** 2 - (dist / 2) ** 2),
        y: -dist / 2 + handpose[currentPoint].y,
      };
    });
    rightFingers.push(new Group(i, points));
    rightFingers[i].setPositionSequence([
      () => {
        return {
          x: window.innerWidth / 2 + 300,
          y: window.innerHeight / 2 + 150,
        };
      },
      (handpose: Handpose, groupId: number) => {
        return {
          x: window.innerWidth / 2 + 200 * (groupId - 2) + 30,
          y: window.innerHeight / 2 + 150,
        };
      },
      (handpose: Handpose, groupId: number) => {
        if (groupId > 0) {
          let resY = 0;
          for (let i = 1; i <= groupId; i++) {
            resY -= Math.min(
              Math.max(
                handpose[4 * (i - 1) + 1].y - handpose[4 * (i - 1) + 4].y,
                0
              ),
              80
            );
          }
          return {
            x: window.innerWidth / 2 + 50,
            y: window.innerHeight / 2 + 150 + resY,
          };
        } else {
          return {
            x: window.innerWidth / 2 + 50,
            y: window.innerHeight / 2 + 150,
          };
        }
      },
    ]);
  }

  const preload = (p5: p5Types) => {
    // 画像などのロードを行う
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.stroke(220);
    p5.fill(220);
    p5.strokeWeight(1);
  };

  const draw = (p5: p5Types) => {
    const rawHands: {
      left: Handpose;
      right: Handpose;
    } = convertHandToHandpose(handpose.current);
    handposeHistory.update(rawHands);
    let hands: {
      left: Handpose;
      right: Handpose;
    } = getSmoothedHandpose(rawHands, handposeHistory); //平滑化された手指の動きを取得する

    hands = {
      left: resizeHandpose(hands.left, gainRef.current),
      right: resizeHandpose(hands.right, gainRef.current),
    };

    // logとしてmonitorに表示する
    debugLog.current = [];
    for (const hand of handpose.current) {
      debugLog.current.push({
        label: hand.handedness + " accuracy",
        value: hand.score,
      });
      debugLog.current.push({
        label: hand.handedness + " is front",
        //@ts-ignore
        value: isFront(hand.keypoints, hand.handedness.toLowerCase()),
      });
    }

    p5.clear();

    displayHands.update(hands);

    if (displayHands.left.pose.length > 0) {
      p5.push();
      p5.fill(220, displayHands.left.opacity);
      leftFingers.forEach((finger, index) => {
        finger.update(displayHands.left.pose);
        finger.show(p5);
      });
      p5.pop();
    }

    if (displayHands.right.pose.length > 0) {
      p5.push();
      p5.fill(220, displayHands.right.opacity);
      rightFingers.forEach((finger, index) => {
        finger.update(displayHands.right.pose);
        finger.show(p5);
      });
      p5.pop();
    }

    // // Animation
    if (!isLost.current && scene01FinishRef.current) {
      animationSequence(leftFingers, scene01FinishRef);
      animationSequence(rightFingers, scene01FinishRef);
      scene01FinishRef.current = false;
    }
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <>
      <Monitor handpose={handpose} debugLog={debugLog} gain={gainRef} />
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        windowResized={windowResized}
      />
    </>
  );
};
