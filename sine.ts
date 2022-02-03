import { Readable } from 'node:stream';
import Speaker from 'speaker';

export default class SineWaveGenerator extends Readable {
  readonly bitDepth = 16;
  readonly channels = 2;
  readonly sampleRate = 44100;
  samplesGenerated = 0;

  constructor(public freq = 440, public duration = 0.4) {
    super();
  }

  play() {
    console.log('Playing...');
    this.pipe(
      new Speaker({
        channels: this.channels,
        bitDepth: this.bitDepth,
        sampleRate: this.sampleRate
      })
    );
  }

  // the Readable "_read()" callback function
  read(n: number) {
    const sampleSize = this.bitDepth / 8;
    const blockAlign = sampleSize * this.channels;
    const numSamples = (n / blockAlign) | 0;
    const buf = Buffer.alloc(numSamples * blockAlign);
    const amplitude = 32760; // Max amplitude for 16-bit audio

    // the "angle" used in the function, adjusted for the number of
    // channels and sample rate. This value is like the period of the wave.
    const t = (Math.PI * 2 * this.freq) / this.sampleRate;

    for (let i = 0; i < numSamples; i++) {
      // fill with a simple sine wave at max amplitude
      for (let channel = 0; channel < this.channels; channel++) {
        const s = this.samplesGenerated + i;
        const val = Math.round(amplitude * Math.sin(t * s)); // sine wave
        const offset = i * sampleSize * this.channels + channel * sampleSize;
        buf.writeInt16LE(val, offset);
      }
    }

    this.push(buf);

    this.samplesGenerated += numSamples;
    if (this.samplesGenerated >= this.sampleRate * this.duration) {
      // after generating "duration" second of audio, emit "end"
      this.push(null);
    }
  }
}
