import { arrayProxyBuilder } from "./array.proxyBuilder";
import { mapProxyBuilder } from "./map.proxyBuilder";
import { objectProxyBuilder } from "./object.proxyBuilder";
import { ObservableMetadataUtils } from "src/decorators/observable";
import { StorePartMetadataUtils } from "src/decorators/storePart";
import { AccessedProperty } from "src/react/store/administrator/propertyKeys/storePropertyKeysManager";

export interface BaseAdtProxyBuilderArgs {
  proxyTypes?: Array<"Array" | "Object" | "Map">;
  onSet?: () => void;
  onAccess?: (accessPath: AccessedProperty) => void;
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
          (ObservableMetadataUtils.is(valType) ||
            StorePartMetadataUtils.is(valType)))) &&
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
