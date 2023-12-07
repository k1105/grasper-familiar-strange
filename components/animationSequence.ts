import { MutableRefObject } from "react";
import { Group } from "../lib/GroupClass";

export const animationSequence = (
  fingers: Group[],
  finishRef: MutableRefObject<Boolean>
) => {
  const timeList: number[] = [
    7, //バラバラに
    27, //下端が消滅
    32, //中間、下から２番目が消滅
    37, //中間、下から１番目が消滅
    42, //縦軸に矯正
    52, //中心部が分裂
    72, //縦に積み重なるモーフィング
    117, //もとに戻る
    137, //中心部が消滅
    147, //縦軸の矯正が解除
    157, //中間、下から１番目が再生
    162, //中間、下から２番目が再生
    167, //下端が再生
    177, //もとに戻る
  ];

  for (let i = 0; i < timeList.length; i++) {
    timeList[i] *= 1000;
  }

  setTimeout(() => {
    for (const finger of fingers) {
      finger.moveTo(1);
    }
  }, timeList[0]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.deactivate(0);
    }
  }, timeList[1]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.deactivate(4 * finger.id + 2, "spring");
    }
  }, timeList[2]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.deactivate(4 * finger.id + 3, "spring");
    }
  }, timeList[3]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.switch(4 * finger.id + 4, 25 + finger.id, "spring");
    }
  }, timeList[4]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.activate(20 + finger.id, "spring");
    }
  }, timeList[5]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.moveTo(2);
    }
  }, timeList[6]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.moveTo(1);
    }
  }, timeList[7]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.deactivate(20 + finger.id, "spring");
    }
  }, timeList[8]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.switch(25 + finger.id, 4 * finger.id + 4, "spring");
    }
  }, timeList[9]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.activate(4 * finger.id + 3);
    }
  }, timeList[10]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.activate(4 * finger.id + 2);
    }
  }, timeList[11]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.activate(0);
    }
  }, timeList[12]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.moveTo(0);
    }
  }, timeList[13]);

  setTimeout(() => {
    finishRef.current = true;
  }, timeList[timeList.length - 1] + 20 * 1000);
};
