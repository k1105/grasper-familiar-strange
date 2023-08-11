import dynamic from "next/dynamic";
import p5Types from "p5";
import { MutableRefObject, useRef } from "react";
import { Hand } from "@tensorflow-models/hand-pose-detection";
import { getSmoothedHandpose } from "../lib/getSmoothedHandpose";
import { convertHandToHandpose } from "../lib/converter/convertHandToHandpose";
import { isFront } from "../lib/detector/isFront";
import { Monitor } from "../components/Monitor";
import { Recorder } from "../components/Recorder";
import { Handpose } from "../@types/global";
import { DisplayHands } from "../lib/DisplayHandsClass";
import { HandposeHistory } from "../lib/HandposeHitsoryClass";
import { Point } from "../lib/PointClass";
import { Group } from "../lib/GroupClass";

type Props = {
  handpose: MutableRefObject<Hand[]>;
};
const Sketch = dynamic(import("react-p5"), {
  loading: () => <></>,
  ssr: false,
});

export const HandSketch = ({ handpose }: Props) => {
  const handposeHistory = new HandposeHistory();
  const displayHands = new DisplayHands();

  const debugLog = useRef<{ label: string; value: any }[]>([]);
  const r = 80;

  const timeList: number[] = [10000, 12000, 15000, 18000, 22000, 26000, 36000];

  const leftPoints: Point[] = [];
  for (let i = 0; i < 21; i++) {
    leftPoints.push(new Point({ x: 0, y: 0 }, i));
    if (i == 0) {
      leftPoints[i].setPositionRule((handpose: Handpose, index: number) => {
        return handpose[0];
      });
    } else {
      leftPoints[i].setPositionRule((handpose: Handpose, index: number) => {
        return handpose[index];
      });
    }
  }

  const rightPoints: Point[] = [];
  for (let i = 0; i < 21; i++) {
    rightPoints.push(new Point({ x: 0, y: 0 }, i));
    if (i == 0) {
      rightPoints[i].setPositionRule((handpose: Handpose, index: number) => {
        return handpose[0];
      });
    } else {
      rightPoints[i].setPositionRule((handpose: Handpose, index: number) => {
        return handpose[index];
      });
    }
  }

  const leftFingers: Group[] = [];
  for (let i = 0; i < 5; i++) {
    leftFingers.push(
      new Group([leftPoints[0], ...leftPoints.slice(4 * i + 1, 4 * i + 5)])
    );
    leftFingers[i].setPositionRule((handpose: Handpose, index: number) => {
      return {
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2 + 150,
      };
    });
    leftFingers[i].originRule = (children: Group[] | Point[]) => {
      return children[0].getPosition();
    };
  }
  const leftHand = new Group(leftFingers);

  const rightFingers: Group[] = [];
  for (let i = 0; i < 5; i++) {
    rightFingers.push(
      new Group([rightPoints[0], ...rightPoints.slice(4 * i + 1, 4 * i + 5)])
    );
    rightFingers[i].setPositionRule((handpose: Handpose, index: number) => {
      return {
        x: window.innerWidth / 2 + 300,
        y: window.innerHeight / 2 + 150,
      };
    });
    rightFingers[i].originRule = (children: Group[] | Point[]) => {
      return children[0].getPosition();
    };
  }

  const preload = (p5: p5Types) => {
    // 画像などのロードを行う
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.stroke(220);
    p5.fill(220);
    p5.strokeWeight(10);
  };

  const draw = (p5: p5Types) => {
    const rawHands: {
      left: Handpose;
      right: Handpose;
    } = convertHandToHandpose(handpose.current);
    handposeHistory.update(rawHands);
    const hands: {
      left: Handpose;
      right: Handpose;
    } = getSmoothedHandpose(rawHands, handposeHistory); //平滑化された手指の動きを取得する

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
        finger.updateGroupPosition(displayHands.left.pose, index);
        finger.updateOrigin(finger.children);
        finger.show(p5);
      });
      p5.pop();
    }

    if (displayHands.right.pose.length > 0) {
      p5.push();
      p5.fill(220, displayHands.right.opacity);
      rightFingers.forEach((finger, index) => {
        finger.updateGroupPosition(displayHands.right.pose, index);
        finger.updateOrigin(finger.children);
        finger.show(p5);
      });
      p5.pop();
    }
  };

  // Animation

  setTimeout(() => {
    for (const finger of leftFingers) {
      finger.updatePositionRule((handpose: Handpose, index: number) => {
        return {
          x: 200 * (index - 2) + window.innerWidth / 2 - 30,
          y: window.innerHeight / 2 + 150,
        };
      });
    }
    for (const finger of rightFingers) {
      finger.updatePositionRule((handpose: Handpose, index: number) => {
        return {
          x: 200 * (index - 2) + window.innerWidth / 2 + 30,
          y: window.innerHeight / 2 + 150,
        };
      });
    }
  }, timeList[0]);

  setTimeout(() => {
    for (const finger of leftFingers) {
      finger.delete(0, (handpose: Handpose, index: number) => {
        return handpose[4 * index + 1];
      });
    }
    for (const finger of rightFingers) {
      finger.delete(0, (handpose: Handpose, index: number) => {
        return handpose[4 * index + 1];
      });
    }
  }, timeList[1]);
  setTimeout(() => {
    for (const finger of leftFingers) {
      finger.delete(
        1,
        (handpose: Handpose, index: number) => {
          return {
            x: (handpose[index + 1].x + handpose[index - 1].x) / 2,
            y: (handpose[index + 1].y + handpose[index - 1].y) / 2,
          };
        },
        "spring"
      );
    }
    for (const finger of rightFingers) {
      finger.delete(
        1,
        (handpose: Handpose, index: number) => {
          return {
            x: (handpose[index + 1].x + handpose[index - 1].x) / 2,
            y: (handpose[index + 1].y + handpose[index - 1].y) / 2,
          };
        },
        "spring"
      );
    }
  }, timeList[2]);
  setTimeout(() => {
    for (const finger of leftFingers) {
      finger.delete(
        1,
        (handpose: Handpose, index: number) => {
          return {
            x: (handpose[index + 1].x + handpose[index - 2].x) / 2,
            y: (handpose[index + 1].y + handpose[index - 2].y) / 2,
          };
        },
        "spring"
      );
    }
    for (const finger of rightFingers) {
      finger.delete(
        1,
        (handpose: Handpose, index: number) => {
          return {
            x: (handpose[index + 1].x + handpose[index - 2].x) / 2,
            y: (handpose[index + 1].y + handpose[index - 2].y) / 2,
          };
        },
        "spring"
      );
    }
  }, timeList[3]);

  setTimeout(() => {
    for (const finger of leftFingers) {
      finger.children[1].updatePositionRule(
        (handpose: Handpose, index: number) => {
          const dist = Math.min(
            Math.max(handpose[index - 3].y - handpose[index].y, 0),
            r
          );
          return {
            x: handpose[index - 3].x,
            y: -dist + handpose[index - 3].y,
          };
        },
        "spring"
      );
    }
    for (const finger of rightFingers) {
      finger.children[1].updatePositionRule(
        (handpose: Handpose, index: number) => {
          const dist = Math.min(
            Math.max(handpose[index - 3].y - handpose[index].y, 0),
            r
          );
          return {
            x: handpose[index - 3].x,
            y: -dist + handpose[index - 3].y,
          };
        },
        "spring"
      );
    }
  }, timeList[4]);

  setTimeout(() => {
    leftFingers.forEach((finger, index) => {
      finger.add(
        1,
        index,
        (handpose: Handpose, index: number) => {
          return {
            x: handpose[index * 4 + 1].x,
            y:
              (handpose[index * 4 + 3].y - handpose[index * 4 + 1].y) / 2 +
              handpose[index * 4 + 1].y,
          };
        },
        (handpose: Handpose, index: number) => {
          const dist = Math.min(
            Math.max(handpose[index * 4 + 1].y - handpose[index * 4 + 4].y, 0),
            r
          );
          return {
            x: handpose[index * 4 + 1].x - Math.sqrt(1600 - (dist / 2) ** 2),
            y: -dist / 2 + handpose[index * 4 + 1].y,
          };
        },
        "spring"
      );
    });
    rightFingers.forEach((finger, index) => {
      finger.add(
        1,
        index,
        (handpose: Handpose, index: number) => {
          return {
            x: handpose[index * 4 + 1].x,
            y:
              (handpose[index * 4 + 3].y - handpose[index * 4 + 1].y) / 2 +
              handpose[index * 4 + 1].y,
          };
        },
        (handpose: Handpose, index: number) => {
          const dist = Math.min(
            Math.max(handpose[index * 4 + 1].y - handpose[index * 4 + 4].y, 0),
            r
          );
          return {
            x: handpose[index * 4 + 1].x + Math.sqrt(1600 - (dist / 2) ** 2),
            y: -dist / 2 + handpose[index * 4 + 1].y,
          };
        },
        "spring"
      );
    });
  }, timeList[5]);

  setTimeout(() => {
    leftFingers.forEach((finger, index) => {
      finger.updatePositionRule((handpose: Handpose, index: number) => {
        if (index > 0) {
          let resY = 0;
          for (let i = 1; i <= index; i++) {
            resY -= Math.min(
              Math.max(
                handpose[4 * (i - 1) + 1].y - handpose[4 * (i - 1) + 4].y,
                0
              ),
              r
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
      });
    });
    rightFingers.forEach((finger, index) => {
      finger.updatePositionRule((handpose: Handpose, index: number) => {
        if (index > 0) {
          let resY = 0;
          for (let i = 1; i <= index; i++) {
            resY -= Math.min(
              Math.max(
                handpose[4 * (i - 1) + 1].y - handpose[4 * (i - 1) + 4].y,
                0
              ),
              r
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
      });
    });
  }, timeList[6]);

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <>
      <Monitor handpose={handpose} debugLog={debugLog} />
      <Recorder handpose={handpose} />
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        windowResized={windowResized}
      />
    </>
  );
};
