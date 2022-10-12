import { arrayProxyBuilder } from "./array.proxyBuilder";
import { mapProxyBuilder } from "./map.proxyBuilder";
import { objectProxyBuilder } from "./object.proxyBuilder";
import { ObservableMetadata } from "src/decorators/observable";
import { StoreMetadata } from "src/decorators/store";
import { StorePartMetadata } from "src/decorators/storePart";
import { decoratorsMetadataStorage } from "src/utils/decoratorsMetadataStorage";

export interface BaseAdtProxyBuilderArgs {
  onSet?: () => void;
  proxyTypes?: Array<"Array" | "Object" | "Map">;
  proxiedValuesStorage: Map<unknown, unknown>;
}

interface AdtProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  value: unknown;
}

export const adtProxyBuilder = ({ value, ...restOfArgs }: AdtProxyBuilderArgs) => {
  // eslint-disable-next-line
  const valType = (value as any)?.constructor;
  const { proxyTypes } = restOfArgs;
  const doMapProxy = proxyTypes?.includes("Map") ?? true;
  const doArrayProxy = proxyTypes?.includes("Array") ?? true;
  const doObjectProxy = proxyTypes?.includes("Object") ?? true;

  try {
    if (
      (valType === Object ||
        (value instanceof Object &&
          (decoratorsMetadataStorage.get<ObservableMetadata>(
            "Observable",
            valType
          )[0] ||
            decoratorsMetadataStorage.get<StoreMetadata>("Store", valType).length ||
            decoratorsMetadataStorage.get<StorePartMetadata>("StorePart", valType)
              .length))) &&
      doObjectProxy
    ) {
      return objectProxyBuilder({
        object: value as object,
        ...restOfArgs,
      });
    }

    if (valType === Array && doArrayProxy) {
      return arrayProxyBuilder({
        array: value as unknown[],
        ...restOfArgs,
      });
    }

    if (value instanceof Map && doMapProxy) {
      return mapProxyBuilder({
        map: value,
        ...restOfArgs,
      });
    }
  } catch (error) {
    // Nothing to do
  }
  return value;
};
