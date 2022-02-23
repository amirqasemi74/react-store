import { ClassType, Func } from "src/types";

export function Hook(hook: Func): PropertyDecorator {
  return function (target, propertyKey) {
    HooksMetadataUtils.add(target.constructor as ClassType, propertyKey, hook);
  };
}

export class HooksMetadataUtils {
  private static readonly KEY = Symbol();

  static add(storeType: ClassType, propertyKey: PropertyKey, hook: Func) {
    this.getOwn(storeType).push({ hook, propertyKey });
  }

  static getOwn(storeType: ClassType): HookMetadata[] {
    let hooks = Reflect.getOwnMetadata(this.KEY, storeType);
    if (!hooks) {
      hooks = [];
      Reflect.defineMetadata(this.KEY, hooks, storeType);
    }
    return hooks;
  }

  static get(storeType: ClassType): HookMetadata[] {
    let hooks = this.getOwn(storeType);
    const parentClass = Reflect.getPrototypeOf(storeType) as ClassType;
    if (parentClass) {
      hooks = hooks.concat(this.get(parentClass));
    }
    return hooks;
  }

  static is(storeType: ClassType, propertyKey: PropertyKey) {
    return this.get(storeType).some((h) => h.propertyKey === propertyKey);
  }
}

interface HookMetadata {
  hook: Func;
  propertyKey: PropertyKey;
}
