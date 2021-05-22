import "reflect-metadata";

export const INJECTABLE = Symbol("Injectable");

export enum Scope {
  SINGLETON = "SINGLETON",
  TRANSIENT = "TRANSIENT",
}

export interface InjectableOptions {
  scope?: Scope;
}

export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(INJECTABLE, options, target);
  };
}
