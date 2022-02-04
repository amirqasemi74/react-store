import lodashGet from "lodash/get";
import type { ClassType } from "src/types";

export function Effect<T extends object>(
  deps?: ((_: T) => Array<unknown>) | Array<string> | string,
  dequal?: boolean
): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    let depsFn!: (_: T) => Array<unknown>;

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
        dequal,
      },
      propertyKey,
    });
    return descriptor;
  };
}

export class EffectsMetadataUtils {
  private static readonly KEY = Symbol();

  static getOwn<T extends object>(storeType: ClassType): EffectMetaData<T>[] {
    let effects = Reflect.getOwnMetadata(this.KEY, storeType);
    if (!effects) {
      effects = [];
      Reflect.defineMetadata(this.KEY, effects, storeType);
    }
    return effects;
  }

  static get<T extends object>(storeType: ClassType): EffectMetaData<T>[] {
    // TODO: Effects must be returns only for @Store & @StorePart
    let effects = this.getOwn(storeType);
    const parentClass = Reflect.getPrototypeOf(storeType) as ClassType;
    if (parentClass) {
      effects = effects.concat(this.get(parentClass));
    }
    return effects;
  }

  static add<T extends object>(storeType: ClassType, metadata: EffectMetaData<T>) {
    this.getOwn<T>(storeType).push(metadata);
  }
}

interface EffectOptions<T extends object> {
  deps?: (_: T) => Array<unknown>;
  dequal?: boolean;
}

export interface EffectMetaData<T extends object> {
  propertyKey: PropertyKey;
  options: EffectOptions<T>;
}
