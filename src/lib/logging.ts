import { styleText } from "node:util";

export const hint = (message: string) => {
  return styleText("green", `❯ ${message}`);
};

export const danger = (message: string) => {
  return styleText("red", `❯ ${message}`);
};
