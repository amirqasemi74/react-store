export interface ClassType<T = any> {
  new (...args: any): T;
}

export type FunctionType = (...args: any[]) => any;
