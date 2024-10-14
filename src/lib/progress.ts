export interface ProgressBarOptions {
  current: number;
  total: number;
  columns?: number;
  complete?: string;
  incomplete?: string;
}

export function renderProgressBar(options: ProgressBarOptions) {
  const { current, total } = options;
  const percent = Math.floor((current / total) * 100);
  const progress = renderProgress(options);
  const totalStr = total.toString();
  return `(${progress}) ${current.toString().padStart(totalStr.length)}/${totalStr} ${percent.toString().padStart(3)}%`;
}

export function renderProgress({
  current,
  total,
  columns = 10,
  complete = "·*○",
  incomplete = " ",
}: ProgressBarOptions) {
  const progress = current / total;
  const parts = complete.length * columns;
  const filledCount = Math.floor(progress * columns);
  const filledParts = Math.floor(progress * parts);
  const partialParts = filledParts - filledCount * complete.length;

  const fullyFilledChar = complete.at(-1) || "=";
  let str = fullyFilledChar.repeat(filledCount);
  if (partialParts > 0) {
    const partialChar = complete[partialParts - 1] || incomplete;
    str += partialChar;
  }
  str += incomplete.repeat(Math.max(columns - str.length, 0));
  return str;
}
