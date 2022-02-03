/*
 * ToneGenerator for node.js
 * generates raw PCM data for a tone,
 * specify frequency, length, volume and sampling rate
 */

export const MAX_16 = 32768;
export const MAX_8 = 128;

const shapes = {
  sine(i: number, cycle: number, volume: number) {
    // i / cycle => value between 0 and 1
    // 0 = beginning of circly
    // 0.25 Math.sin = 1
    // 0.5 Math.sin = 0
    // 0.75 Math.sin = -1
    // 1 Math.sin = 1
    return Math.min(volume * Math.sin((i / cycle) * Math.PI * 2), volume - 1);
  },
  triangle(i: number, cycle: number, volume: number) {
    const halfCycle = cycle / 2;
    let level;

    if (i < halfCycle) {
      level = volume * 2 * (i / halfCycle) - volume;
    } else {
      i -= halfCycle;
      level = -(volume * 2) * (i / halfCycle) + volume;
    }

    return Math.min(level, volume - 1);
  },
  saw(i: number, cycle: number, volume: number) {
    return Math.min(volume * 2 * (i / cycle) - volume, volume - 1);
  },
  square(i: number, cycle: number, volume: number) {
    if (i > cycle / 2) {
      return volume - 1;
    }

    return -volume;
  }
};

type Shape = keyof typeof shapes;
type Generator = typeof shapes[Shape];

function generateCycle(
  cycle: number,
  volume: number,
  shape: Shape | Generator
) {
  const data = [];
  let tmp;
  const generator = typeof shape === 'function' ? shape : shapes[shape];
  if (!generator) {
    throw new Error(
      `Invalid wave form: "${shape}" choose between: ${Object.keys(shapes)}`
    );
  }

  for (let i = 0; i < cycle; i++) {
    tmp = generator(i, cycle, volume);
    data[i] = Math.round(tmp);
  }
  return data;
}

export default function tone({
  freq = 440,
  rate = 44100,
  lengthInSecs = 2,
  volume = MAX_8,
  shape = 'sine' as Shape
} = {}) {
  const cycle = Math.floor(rate / freq);
  const samplesLeft = lengthInSecs * rate;
  const cycles = samplesLeft / cycle;
  let ret: number[] = [];

  for (let i = 0; i < cycles; i++) {
    ret = ret.concat(generateCycle(cycle, volume, shape));
  }

  return ret;
}
