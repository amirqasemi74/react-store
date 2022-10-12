import { ClassType } from "src/types";
import { decoratorsMetadataStorage } from "src/utils/decoratorsMetadataStorage";

export function Inject(...deps: any[]) {
  return function (...args: [ClassType] | [ClassType, undefined, number]) {
    const [target, , paramIndex] = args;
    let type: InjectType;

    // deps len === 0:
    // 1. called from @Injectable
    // 2. parameter decorator
    if (deps.length === 0 && args.length === 1) {
      type = "CLASS_METADATA";
      deps = Reflect.getOwnMetadata("design:paramtypes", target) || null;
    } else {
      type = args.length === 1 ? "CLASS" : "PARAMETER";
    }

    const hasInjectType = (type: InjectType) =>
      decoratorsMetadataStorage
        .getOwn<InjectMetadata>("Inject", target)
        .some((inj) =>
          inj.type === "PARAMETER"
            ? inj.type === type
            : inj.type === type && inj.deps !== null
        );

    if (hasInjectType("PARAMETER") && type === "CLASS") {
      throw new Error(
        `Dependencies are injecting by @Inject() as parameter and class decorator for \`class ${target.name}\`. Use one of them.`
      );
    }

    if (type === "PARAMETER") {
      decoratorsMetadataStorage.add<InjectMetadata>("Inject", target, {
        type,
        dep: deps[0],
        paramIndex: paramIndex!,
      });
    } else {
      decoratorsMetadataStorage.add<InjectMetadata>("Inject", target, {
        deps,
        type,
      });
    }

    if (hasInjectType("CLASS") && hasInjectType("CLASS_METADATA")) {
      console.warn(
        `Dependencies are automatically detected for \`class ${target.name}\`. Remove @Inject(...)`
      );
    }
  };
}

export const getClassDependenciesType = (
  classType: ClassType | null
): ClassType[] => {
  if (classType) {
    let depsType: ClassType[] = [];
    const metadata = decoratorsMetadataStorage.getOwn<InjectMetadata>(
      "Inject",
      classType
    );
    metadata.forEach((inj) => {
      if (inj.type === "CLASS" || inj.type === "CLASS_METADATA") {
        depsType = inj.deps || [];
      }
    });
    metadata.forEach((inj) => {
      if (inj.type === "PARAMETER") {
        depsType[inj.paramIndex] = inj.dep;
      }
    });

    return depsType.length
      ? depsType
      : getClassDependenciesType(Reflect.getPrototypeOf(classType) as ClassType);
  }

  return [];
};

export type DecoratedWith = "STORE" | "STORE_PART" | "INJECTABLE";
type InjectType = "CLASS" | "CLASS_METADATA" | "PARAMETER";

type InjectMetadata =
  | {
      deps: ClassType[] | null;
      type: "CLASS" | "CLASS_METADATA";
    }
  | {
      type: "PARAMETER";
      dep: ClassType;
      paramIndex: number;
    };
