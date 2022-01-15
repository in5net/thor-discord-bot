const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇'] as const;

export default class Progress {
  value = 0;
  #percent = 0;
  private timer: NodeJS.Timer;
  private index = 0;

  constructor(
    readonly label: string,
    readonly total: number,
    readonly length = 50
  ) {
    this.print();
    this.timer = setInterval(() => {
      this.print();
      this.index = (this.index + 1) % spinner.length;
    }, 1000 / spinner.length);
  }

  get percent(): number {
    return this.#percent;
  }

  private print(): void {
    const { label, value, total, length } = this;
    const ratio = this.value / total;
    const percent = Math.floor(ratio * 100);
    this.#percent = percent;

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    const filled = Math.floor(ratio * length);
    process.stdout.write(
      `${spinner[this.index]} ${label} ${'█'.repeat(
        filled
      )}\u001b[2m${'█'.repeat(length - filled)}\u001b[22m ${value
        .toString()
        .padStart(total.toString().length, ' ')}/${total} | ${percent}%`
    );
  }

  inc(): boolean {
    if (++this.value >= this.total) {
      this.stop();
      return true;
    }
    return false;
  }

  stop(): void {
    clearInterval(this.timer);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log('Done');
  }
}
