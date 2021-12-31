import { Inject } from "./inject";
import "reflect-metadata";

export function Injectable(scope = Scope.SINGLETON): ClassDecorator {
  return function (target: Function) {
    InjectableMetadataUtils.set(target, scope);
    Inject()(target);
  };
}

export class InjectableMetadataUtils {
  private static readonly KEY = Symbol();

  static set(target: Function, scope: Scope) {
    Reflect.defineMetadata(this.KEY, scope, target);
  }

  static is(target: Function) {
    return Reflect.hasOwnMetadata(this.KEY, target);
  }

  static get(target: Function): Scope | null {
    return Reflect.getOwnMetadata(this.KEY, target) || null;
  }
}

export enum Scope {
  SINGLETON = "SINGLETON",
  TRANSIENT = "TRANSIENT",
}
