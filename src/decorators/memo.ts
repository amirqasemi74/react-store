import { decoratorsMetadataStorage } from "../utils/decoratorsMetadataStorage";
import lodashGet from "lodash/get";
import { ClassType } from "src/types";

type DepFn<T> = (storeInstance: T) => Array<unknown>;

export function Memo<T extends object>(
  deps: DepFn<T> | Array<string> | string,
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

    decoratorsMetadataStorage.add<MemoMetadata>(
      "Memo",
      target.constructor as ClassType,
      {
        options: {
          deps: depsFn,
          deepEqual,
        } as MemoOptions,
        propertyKey,
      }
    );
    return descriptor;
  };
}

interface MemoOptions<T extends object = object> {
  deps?: (_: T) => Array<unknown>;
  deepEqual?: boolean;
}

export interface MemoMetadata {
  propertyKey: PropertyKey;
  options: MemoOptions;
}
