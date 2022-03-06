import {
  AccessedPath,
  AccessedProperty,
} from "src/react/store/administrator/propertyKeys/storePropertyKeysManager";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

type AccessedPathDetail = GetSetPath & {
  hasDeeperAccess?: boolean;
  skipDeeperAccess?: boolean;
};

export class GetSetPathsCalculator {
  private getSetPaths: Map<AccessedProperty, AccessedPathDetail | null>;
  constructor(
    private storeAdmin: StoreAdministrator,
    private accessedProperties: AccessedProperty[]
  ) {
    this.getSetPaths = new Map(this.accessedProperties.map((ap) => [ap, null]));
  }

  calcPaths() {
    const injectedStoresDeps: GetSetPaths = [];

    this.accessedProperties.forEach((ap, i) => {
      const valueStoreAdmin = StoreAdministrator.get(ap.value);
      if (valueStoreAdmin && valueStoreAdmin.type !== this.storeAdmin.type) {
        const storeAdmin = StoreAdministrator.get(ap.value)!;
        storeAdmin.propertyKeysManager.calcPaths().forEach(({ path, type }) => {
          injectedStoresDeps.push({ type, path: [ap.propertyKey, ...path] });
        });
      } else {
        if (ap.type === "GET") {
          this.calcGetPath(ap, i);
        } else {
          this.calcSetPath(ap, i);
        }
      }
    });

    const deps = Array.from(this.getSetPaths.values())
      .filter(
        (p) =>
          p && !p.hasDeeperAccess && Reflect.has(this.storeAdmin.instance, p.path[0])
      )
      .filter((ap, i, paths) => {
        // Remove Duplicate paths
        if (ap) {
          const j = paths.findIndex(
            (_ap) =>
              ap.type === _ap?.type &&
              ap.path.length === _ap.path.length &&
              ap.path.every((p, j) => _ap.path[j] === p)
          );
          return j === -1 ? true : j === i;
        }
        return false;
      })
      .concat(injectedStoresDeps) as GetSetPaths;

    return deps;
  }

  /**
   * Here we incrementally detect paths
   */
  private calcGetPath(ap: AccessedProperty, index: number) {
    if (ap.target === this.storeAdmin.instance) {
      this.getSetPaths.set(ap, { type: "GET", path: [ap.propertyKey] });
      return;
    }
    for (let i = index - 1; i >= 0; i--) {
      const currentAp = this.accessedProperties[i];
      if (ap.target === this.accessedProperties[i].value) {
        const prePath = this.getSetPaths.get(this.accessedProperties[i]);
        if (prePath) {
          // before with array full access method
          if (prePath.skipDeeperAccess) {
            break;
          }

          // if array full access property get
          if (
            this.isInArrayProto(ap) ||
            Object.prototype.hasOwnProperty.call(
              Object.getPrototypeOf(ap.target),
              ap.propertyKey
            )
          ) {
            prePath.skipDeeperAccess = true;
            break;
          }
          // pre detect path is not valid and path is longer
          this.getSetPaths.set(currentAp, { ...prePath, hasDeeperAccess: true });
          this.getSetPaths.set(ap, {
            type: "GET",
            path: [...prePath.path, ap.propertyKey],
          });
        } else {
          this.getSetPaths.set(ap, { type: "GET", path: [ap.propertyKey] });
        }
        break;
      }
    }
  }

  private calcSetPath(ap: AccessedProperty, index: number) {
    if (ap.target === this.storeAdmin.instance) {
      this.getSetPaths.set(ap, { type: "SET", path: [ap.propertyKey] });
      return;
    }
    for (let i = index - 1; i >= 0; i--) {
      if (ap.target === this.accessedProperties[i].value) {
        const prePath = this.getSetPaths.get(this.accessedProperties[i]);
        if (prePath) {
          prePath.hasDeeperAccess = true;
          this.getSetPaths.set(ap, {
            type: "SET",
            path: [...prePath.path, ap.propertyKey],
          });
        }
        break;
      }
    }
  }

  private isInArrayProto(ap: AccessedProperty) {
    return (
      Array.isArray(ap.target) &&
      FullArrayAccessMethods.includes(ap.propertyKey.toString())
    );
  }
}

type GetSetPath = { type: "GET" | "SET"; path: AccessedPath };
export type GetSetPaths = Array<GetSetPath>;

const FullArrayAccessMethods = [
  "length",
  "copyWithin",
  "find",
  "findIndex",
  "lastIndexOf",
  "reverse",
  "slice",
  "sort",
  "splice",
  "includes",
  "indexOf",
  "join",
  "keys",
  "entries",
  "values",
  "forEach",
  "filter",
  "flat",
  "flatMap",
  "map",
  "every",
  "some",
  "reduce",
  "reduceRight",
  "toLocaleString",
  "toString",
  "findLast",
  "findLastIndex",
];
