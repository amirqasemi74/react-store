import { decoratorsMetadataStorage } from "../utils/decoratorsMetadataStorage";
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

    decoratorsMetadataStorage.add<EffectMetaData>(
      "Effect",
      target.constructor as ClassType,
      {
        options: {
          deps: depsFn,
          deepEqual,
        } as ManualEffectOptions,
        propertyKey,
      }
    );
    return descriptor;
  };
}

export interface ManualEffectOptions<T extends object = object> {
  auto?: false;
  deps?: (_: T) => Array<unknown>;
  deepEqual?: boolean;
}

type EffectOptions = ManualEffectOptions;

export interface EffectMetaData {
  propertyKey: PropertyKey;
  options: EffectOptions;
}
