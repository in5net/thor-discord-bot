import { Readable } from 'node:stream';

import header from './waveheader';

const channels = 2;
const sampleRate = 48000;
const bitDepth = 16;
const amplitude = 2 ** (bitDepth - 1) - 1;

export class PCMStream extends Readable {
  private samplesGenerated = 0;

  constructor(readonly frequency: number, readonly duration = Infinity) {
    super();
  }

  // eslint-disable-next-line no-underscore-dangle
  _read(size: number) {
    const sampleSize = bitDepth / 8;
    const blockAlign = sampleSize * channels;
    const numSamples = (size / blockAlign) | 0;
    const buffer = Buffer.alloc(numSamples * blockAlign);

    // the "angle" used in the function, adjusted for the number of
    // channels and sample rate. This value is like the period of the wave.
    const t = (Math.PI * 2 * this.frequency) / sampleRate;

    for (let i = 0; i < numSamples; i++) {
      // fill with a simple sine wave at max amplitude
      for (let channel = 0; channel < channels; channel++) {
        const s = this.samplesGenerated + i;
        const val = Math.round(amplitude * Math.sin(t * s)); // sine wave
        const offset = i * sampleSize * channels + channel * sampleSize;
        buffer.writeInt16LE(val, offset);
      }
    }

    this.push(buffer);
    this.samplesGenerated += numSamples;

    this.samplesGenerated += numSamples;
    if (this.samplesGenerated >= sampleRate * this.duration)
      // after generating "duration" second of audio, emit "end"
      this.push(null);
  }
}

export default function wav(frequency: number, duration?: number): PCMStream {
  const stream = new PCMStream(frequency, duration);
  stream.push(
    header(duration ? duration * sampleRate : undefined, {
      channels,
      sampleRate,
      bitDepth
    })
  );
  return stream;
}
