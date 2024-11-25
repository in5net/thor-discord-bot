import { type Range } from "./range";

export class CommandError extends Error {
  constructor(
    message: string,
    readonly range: Range,
  ) {
    super(message);
    this.name = "CommandError";
  }

  format(source: string) {
    const {
      message,
      range: [start, end],
    } = this;
    const lines = source.split("\n");
    let lineStartIndex = 0;
    const relevantLines: string[] = [];
    let lineRange: Range = [0, 0];
    for (const line of lines) {
      if (start >= lineStartIndex) {
        relevantLines.push(line);
        lineRange = [start - lineStartIndex, end - lineStartIndex];
      }

      lineStartIndex += line.length;
      if (end < lineStartIndex) {
        break;
      }
    }

    return `${relevantLines.join("\n")}
${" ".repeat(lineRange[0])}${"^".repeat(lineRange[1] - lineRange[0])}
${message}`;
  }
}
