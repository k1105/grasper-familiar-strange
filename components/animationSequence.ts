import { Group } from "../lib/GroupClass";

export const animationSequence = (fingers: Group[]) => {
  const timeList: number[] = [];
  for (let i = 0; i < 20; i++) {
    timeList.push((i + 1) * 5000);
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
      finger.deactivate(4 * finger.id + 2);
    }
  }, timeList[2]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.deactivate(4 * finger.id + 3);
    }
  }, timeList[3]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.switch(4 * finger.id + 4, 25 + finger.id);
    }
  }, timeList[4]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.activate(20 + finger.id);
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
      finger.deactivate(20 + finger.id);
    }
  }, timeList[8]);

  setTimeout(() => {
    for (const finger of fingers) {
      finger.switch(25 + finger.id, 4 * finger.id + 4);
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
};
