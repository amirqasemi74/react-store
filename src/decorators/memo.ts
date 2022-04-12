import lodashGet from "lodash/get";
import { ClassType } from "src/types";

type DepFn<T> = (storeInstance: T) => Array<unknown>;

export function Memo<T extends object>(
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

    MemosMetadataUtils.add(target.constructor as ClassType, {
      options: {
        deps: depsFn,
        deepEqual,
      } as MemoOptions,
      propertyKey,
    });
    return descriptor;
  };
}

export class MemosMetadataUtils {
  private static readonly KEY = Symbol();

  static getOwn(storeType: ClassType): MemoMetadata[] {
    let effects = Reflect.getOwnMetadata(this.KEY, storeType);
    if (!effects) {
      effects = [];
      Reflect.defineMetadata(this.KEY, effects, storeType);
    }
    return effects;
  }

  static get(storeType: ClassType): MemoMetadata[] {
    let effects = this.getOwn(storeType);
    const parentClass = Reflect.getPrototypeOf(storeType) as ClassType;
    if (parentClass) {
      effects = effects.concat(this.get(parentClass));
    }
    return effects;
  }

  static add(storeType: ClassType, metadata: MemoMetadata) {
    this.getOwn(storeType).push(metadata);
  }
}

interface MemoOptions<T extends object = object> {
  deps?: (_: T) => Array<unknown>;
  deepEqual?: boolean;
}

export interface MemoMetadata {
  propertyKey: PropertyKey;
  options: MemoOptions;
}
