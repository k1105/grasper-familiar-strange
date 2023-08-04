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

  const leftPoints: Point[] = [];
  for (let i = 0; i < 21; i++) {
    leftPoints.push(new Point({ x: 0, y: 0 }));
  }

  const rightPoints: Point[] = [];
  for (let i = 0; i < 21; i++) {
    rightPoints.push(new Point({ x: 0, y: 0 }));
  }

  const leftFingers: Group[] = [];
  for (let i = 0; i < 5; i++) {
    leftFingers.push(
      new Group([leftPoints[0], ...leftPoints.slice(4 * i + 1, 4 * i + 5)])
    );
    leftFingers[i].sequence = [
      {
        at: 0,
        position: (handpose: Handpose, index: number) => {
          return {
            x: window.innerWidth / 2 - 300,
            y: window.innerHeight / 2 + 50,
          };
        },
      },
      {
        at: 5,
        position: (handpose: Handpose, index: number) => {
          return {
            x: window.innerWidth / 2 - 300,
            y: window.innerHeight / 2 + 50,
          };
        },
      },
      {
        at: 7,
        position: (handpose: Handpose, index: number) => {
          return {
            x: 200 * (index - 2) + window.innerWidth / 2 - 30,
            y: window.innerHeight / 2 + 50,
          };
        },
      },
    ];
  }

  const rightFingers: Group[] = [];
  for (let i = 0; i < 5; i++) {
    rightFingers.push(
      new Group([rightPoints[0], ...rightPoints.slice(4 * i + 1, 4 * i + 5)])
    );
    rightFingers[i].sequence = [
      {
        at: 0,
        position: (handpose: Handpose, index: number) => {
          return {
            x: window.innerWidth / 2 + 300,
            y: window.innerHeight / 2 + 50,
          };
        },
      },
      {
        at: 5,
        position: (handpose: Handpose, index: number) => {
          return {
            x: window.innerWidth / 2 + 300,
            y: window.innerHeight / 2 + 50,
          };
        },
      },
      {
        at: 7,
        position: (handpose: Handpose, index: number) => {
          return {
            x: 200 * (index - 2) + window.innerWidth / 2 + 30,
            y: window.innerHeight / 2 + 50,
          };
        },
      },
    ];
  }

  const preload = (p5: p5Types) => {
    // 画像などのロードを行う
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.stroke(220);
    p5.fill(255);
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
      p5.fill(255, displayHands.left.opacity);
      leftPoints.forEach((point, index) => {
        point.position = displayHands.left.pose[index];
      });
      leftFingers.forEach((finger, index) => {
        const sec = p5.millis() / 1000;
        if (finger.sequenceHead + 1 < finger.sequence.length) {
          if (sec >= finger.sequence[finger.sequenceHead + 1].at) {
            finger.sequenceHead++;
          }
        }
        if (finger.sequenceHead + 1 < finger.sequence.length) {
          //更新直後に実行させたくないという理由だけで55行目と同じ判定をしているのが気持ち悪い
          //quadratic (https://nakamura001.hatenablog.com/entry/20111117/1321539246)
          let t = sec - finger.sequence[finger.sequenceHead].at;
          const b = finger.sequence[finger.sequenceHead].position(
            displayHands.left.pose,
            index
          );
          const c = {
            x:
              finger.sequence[finger.sequenceHead + 1].position(
                displayHands.left.pose,
                index
              ).x -
              finger.sequence[finger.sequenceHead].position(
                displayHands.left.pose,
                index
              ).x,
            y:
              finger.sequence[finger.sequenceHead + 1].position(
                displayHands.left.pose,
                index
              ).y -
              finger.sequence[finger.sequenceHead].position(
                displayHands.left.pose,
                index
              ).y,
          };
          const d =
            finger.sequence[finger.sequenceHead + 1].at -
            finger.sequence[finger.sequenceHead].at;
          t /= d / 2;
          if (t < 1) {
            finger.position = {
              x: (c.x / 2) * t ** 2 + b.x,
              y: (c.y / 2) * t ** 2 + b.y,
            };
          } else {
            t = t - 1;
            finger.position = {
              x: (-c.x / 2) * (t * (t - 2) - 1) + b.x,
              y: (-c.y / 2) * (t * (t - 2) - 1) + b.y,
            };
          }
        }
        finger.origin = finger.children[0].position;
        finger.show(p5);
      });
      p5.pop();
    }

    if (displayHands.right.pose.length > 0) {
      p5.push();
      p5.fill(255, displayHands.right.opacity);
      rightPoints.forEach((point, index) => {
        point.position = displayHands.right.pose[index];
      });
      rightFingers.forEach((finger, index) => {
        const sec = p5.millis() / 1000;
        if (finger.sequenceHead + 1 < finger.sequence.length) {
          if (sec >= finger.sequence[finger.sequenceHead + 1].at) {
            finger.sequenceHead++;
          }
        }
        if (finger.sequenceHead + 1 < finger.sequence.length) {
          //更新直後に実行させたくないという理由だけで55行目と同じ判定をしているのが気持ち悪い
          //quadratic (https://nakamura001.hatenablog.com/entry/20111117/1321539246)
          let t = sec - finger.sequence[finger.sequenceHead].at;
          const b = finger.sequence[finger.sequenceHead].position(
            displayHands.right.pose,
            index
          );
          const c = {
            x:
              finger.sequence[finger.sequenceHead + 1].position(
                displayHands.right.pose,
                index
              ).x -
              finger.sequence[finger.sequenceHead].position(
                displayHands.right.pose,
                index
              ).x,
            y:
              finger.sequence[finger.sequenceHead + 1].position(
                displayHands.right.pose,
                index
              ).y -
              finger.sequence[finger.sequenceHead].position(
                displayHands.right.pose,
                index
              ).y,
          };
          const d =
            finger.sequence[finger.sequenceHead + 1].at -
            finger.sequence[finger.sequenceHead].at;
          t /= d / 2;
          if (t < 1) {
            finger.position = {
              x: (c.x / 2) * t ** 2 + b.x,
              y: (c.y / 2) * t ** 2 + b.y,
            };
          } else {
            t = t - 1;
            finger.position = {
              x: (-c.x / 2) * (t * (t - 2) - 1) + b.x,
              y: (-c.y / 2) * (t * (t - 2) - 1) + b.y,
            };
          }
        }
        finger.origin = finger.children[0].position;
        finger.show(p5);
      });
      p5.pop();
    }
  };

  setTimeout(() => {
    for (const finger of leftFingers) {
      finger.delete(0);
    }
    for (const finger of rightFingers) {
      finger.delete(0);
    }
  }, 10000);
  setTimeout(() => {
    for (const finger of leftFingers) {
      finger.delete(1);
    }
    for (const finger of rightFingers) {
      finger.delete(1);
    }
  }, 12000);
  setTimeout(() => {
    for (const finger of leftFingers) {
      finger.delete(1);
    }
    for (const finger of rightFingers) {
      finger.delete(1);
    }
  }, 13000);

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
