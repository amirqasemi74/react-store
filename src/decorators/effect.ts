import objectPath from "object-path";
import type { ClassType } from "src/types";

export function Effect<T extends object = any>(
  deps?: ((_: T) => Array<any>) | Array<string> | string,
  dequal?: boolean
): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    let depsFn!: (_: T) => Array<any>;

    if (typeof deps === "function") {
      depsFn = deps;
    } else if (Array.isArray(deps)) {
      depsFn = (o) => deps.map((d) => objectPath.withInheritedProps.get(o, d));
    } else if (typeof deps === "string") {
      depsFn = (o) => [objectPath.withInheritedProps.get(o, deps)];
    }

    EffectsMetadataUtils.add(target.constructor, {
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

  static getOwn(storeType: Function): EffectMetaData[] {
    let effects = Reflect.getOwnMetadata(this.KEY, storeType);
    if (!effects) {
      effects = [];
      Reflect.defineMetadata(this.KEY, effects, storeType);
    }
    return effects;
  }

  static get(storeType: Function): EffectMetaData[] {
    // TODO: Effects must be returns only for @Store & @StorePart
    let effects = this.getOwn(storeType);
    const parentClass = Reflect.getPrototypeOf(storeType) as ClassType;
    if (parentClass) {
      effects = effects.concat(this.get(parentClass));
    }
    return effects;
  }

  static add(storeType: Function, metadata: EffectMetaData) {
    this.getOwn(storeType).push(metadata);
  }
}

interface EffectOptions<T extends {} = any> {
  deps?: (_: T) => Array<any>;
  dequal?: boolean;
}

export interface EffectMetaData {
  propertyKey: PropertyKey;
  options: EffectOptions;
}
