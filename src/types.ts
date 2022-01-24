export interface ClassType<T = any> {
  new (...args: any): T;
}

export type Func<T = void> = () => T;
