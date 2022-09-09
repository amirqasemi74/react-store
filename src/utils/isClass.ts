import { ClassType } from "src/types";

export const isClass = (value: unknown): value is ClassType =>
  typeof value === "function";
