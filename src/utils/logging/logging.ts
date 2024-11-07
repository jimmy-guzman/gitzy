import { blue, red, yellow } from "ansi-colors";

export const info = (message: string): string => {
  return blue(`❯ ${message}`);
};
export const hint = (message: string): string => {
  return yellow(`❯ ${message}`);
};
export const danger = (message: string): string => {
  return red(`❯ ${message}`);
};

export const log = (message: string): void => {
  console.log(message);
};
