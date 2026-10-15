import { styleText } from "node:util";

import { log, S_BAR, S_ERROR, S_INFO, S_WARN } from "@clack/prompts";

type Color = "blue" | "red" | "yellow";

/**
 * Writes a clack log line to stderr, colored for stderr rather than stdout.
 */
const write = (color: Color, symbol: string, message: string) => {
  log.message(message, {
    output: process.stderr,
    secondarySymbol: styleText("gray", S_BAR, { stream: process.stderr }),
    symbol: styleText(color, symbol, { stream: process.stderr }),
  });
};

/**
 * clack log calls routed to stderr, so stdout only carries command results.
 */
export const notice = {
  error: (message: string) => {
    write("red", S_ERROR, message);
  },
  info: (message: string) => {
    write("blue", S_INFO, message);
  },
  warn: (message: string) => {
    write("yellow", S_WARN, message);
  },
};
