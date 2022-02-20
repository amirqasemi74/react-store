import lodashGet from "lodash/get";
import type { ClassType } from "src/types";

type DepFn<T> = (storeInstance: T) => Array<unknown>;

export function Effect<T extends object>(
  deps?: DepFn<T> | Array<string> | string,
  deepEqual?: boolean
): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    let depsFn: DepFn<T> | undefined;
    if (typeof deps === "function") {
      depsFn = deps;
    } else if (Array.isArray(deps)) {
      depsFn = (o) => deps.map((d) => lodashGet(o, d));
    } else if (typeof deps === "string") {
      depsFn = (o) => [lodashGet(o, deps)];
    }

    EffectsMetadataUtils.add(target.constructor as ClassType, {
      options: {
        deps: depsFn,
        deepEqual,
      } as ManualEffectOptions,
      propertyKey,
    });
    return descriptor;
  };
}

export function AutoEffect(deepEqual?: boolean): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    EffectsMetadataUtils.add(target.constructor as ClassType, {
      options: {
        deepEqual,
        auto: true,
      },
      propertyKey,
    });
    return descriptor;
  };
}

export class EffectsMetadataUtils {
  private static readonly KEY = Symbol();

  static getOwn(storeType: ClassType): EffectMetaData[] {
    let effects = Reflect.getOwnMetadata(this.KEY, storeType);
    if (!effects) {
      effects = [];
      Reflect.defineMetadata(this.KEY, effects, storeType);
    }
    return effects;
  }

  static get(storeType: ClassType): EffectMetaData[] {
    // TODO: Effects must be returns only for @Store & @StorePart
    let effects = this.getOwn(storeType);
    const parentClass = Reflect.getPrototypeOf(storeType) as ClassType;
    if (parentClass) {
      effects = effects.concat(this.get(parentClass));
    }
    return effects;
  }

  static add(storeType: ClassType, metadata: EffectMetaData) {
    this.getOwn(storeType).push(metadata);
  }
}

interface ManualEffectOptions<T extends object = object> {
  auto?: false;
  deps?: (_: T) => Array<unknown>;
  deepEqual?: boolean;
}

interface AutoEffectOptions {
  auto: true;
  deepEqual?: boolean;
}

type EffectOptions = ManualEffectOptions | AutoEffectOptions;

export interface EffectMetaData {
  propertyKey: PropertyKey;
  options: EffectOptions;
}
