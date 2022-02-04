import { Inject } from "./inject";
import "reflect-metadata";
import { ClassType } from "src/types";

export function Injectable(scope = Scope.SINGLETON): ClassDecorator {
  return function (target: ClassType) {
    InjectableMetadataUtils.set(target, scope);
    Inject()(target);
  } as ClassDecorator;
}

export class InjectableMetadataUtils {
  private static readonly KEY = Symbol();

  static set(target: ClassType, scope: Scope) {
    Reflect.defineMetadata(this.KEY, scope, target);
  }

  static is(target: ClassType) {
    return Reflect.hasOwnMetadata(this.KEY, target);
  }

  static get(target: ClassType): Scope | null {
    return Reflect.getOwnMetadata(this.KEY, target) || null;
  }
}

export enum Scope {
  SINGLETON = "SINGLETON",
  TRANSIENT = "TRANSIENT",
}
