// eslint-disable-next-line
export interface ClassType<T = any> extends Function {
  new (...args: any[]): T;
}

export type Func<T = unknown> = (...args: any[]) => T;
