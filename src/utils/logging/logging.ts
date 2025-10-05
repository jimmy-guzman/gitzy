import { styleText } from "node:util";

export const info = (message: string): string => {
  return styleText("blue", `❯ ${message}`);
};

export const hint = (message: string): string => {
  return styleText("yellow", `❯ ${message}`);
};

export const danger = (message: string): string => {
  return styleText("red", `❯ ${message}`);
};

export const log = (message: string): void => {
  // eslint-disable-next-line no-console -- console.log is used for logging messages
  console.log(message);
};
