import {
  AccessedPath,
  AccessedProperty,
} from "src/react/store/administrator/propertyKeys/storePropertyKeysManager";
import { ClassType } from "src/types";

type AccessedPathDetail = GetSetPath & {
  hasDeeperAccess?: boolean;
  skipDeeperAccess?: boolean;
};

export class GetSetPathsCalculator {
  private getSetPaths: Map<AccessedProperty, AccessedPathDetail | null>;
  constructor(
    private storeInstance: InstanceType<ClassType>,
    private accessedProperties: AccessedProperty[]
  ) {
    this.getSetPaths = new Map(this.accessedProperties.map((ap) => [ap, null]));
  }

  calcPaths() {
    this.accessedProperties.forEach((ap, i) => {
      if (ap.type === "GET") {
        this.calcGetPath(ap, i);
      } else {
        this.calcSetPath(ap, i);
      }
    });

    return Array.from(this.getSetPaths.values())
      .filter(
        (p) => p && !p.hasDeeperAccess && Reflect.has(this.storeInstance, p.path[0])
      )
      .filter(
        (ap, i, paths) =>
          ap &&
          paths.findIndex(
            (_ap) =>
              ap.type === _ap?.type && ap.path.every((p, j) => _ap.path[j] === p)
          ) === i
      ) as GetSetPaths;
  }

  /**
   * Here we incrementally detect paths
   */
  private calcGetPath(ap: AccessedProperty, index: number) {
    if (ap.target === this.storeInstance) {
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
    if (ap.target === this.storeInstance) {
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
