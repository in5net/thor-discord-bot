import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import pino, { type TransportTargetOptions } from "pino";

const logsPath = new URL("../../logs", import.meta.url).pathname;
if (!existsSync(logsPath)) {
  mkdirSync(logsPath);
}

const destination = path.join(
  logsPath,
  `${new Date().toISOString().replaceAll(":", "-")}.log`,
);
const targets: TransportTargetOptions[] = [
  {
    level: "debug",
    target: "pino/file",
    options: {
      destination,
    },
  },
  {
    level: "debug",
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
];

const logger = pino({
  transport: { targets },
});
export default logger;
