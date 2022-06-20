const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇'] as const;

export default class Progress {
  value = 0;
  #percent = 0;
  private timer: NodeJS.Timer;
  private index = 0;

  constructor(readonly label: string, readonly total: number) {
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
    const { label, value, total } = this;
    const ratio = this.value / total;
    const percent = Math.floor(ratio * 100);
    this.#percent = percent;

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    const start = `${spinner[this.index]} ${label} `;
    const end = ` ${value
      .toString()
      .padStart(total.toString().length, ' ')}/${total} | ${percent}%`;

    const length = process.stdout.columns - start.length - end.length;
    const filled = Math.floor(ratio * length);

    process.stdout.write(
      `${start}${'█'.repeat(filled)}\u001b[2m${'█'.repeat(
        length - filled
      )}\u001b[22m${end}`
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
