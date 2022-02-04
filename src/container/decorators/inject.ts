import { StoreMetadataUtils } from "../../decorators/store";
import { InjectableMetadataUtils } from "./Injectable";
import { StorePartMetadataUtils } from "src/decorators/storePart";
import { ClassType } from "src/types";

export function Inject(...deps: any[]) {
  return function (...args: [ClassType] | [ClassType, undefined, number]) {
    const [target, , paramIndex] = args;
    let injectType: InjectType;

    if (deps.length === 0) {
      injectType = "CLASS_METADATA";
      deps = Reflect.getOwnMetadata("design:paramtypes", target) || [];
    } else {
      injectType = args.length === 1 ? "CLASS" : "PARAMETER";
    }

    InjectMetadataUtils.setDependencies({
      deps,
      target,
      paramIndex,
      type: injectType,
    });
  };
}

export class InjectMetadataUtils {
  private static readonly DEP_TYPES = Symbol();

  private static hasInjectType(target: ClassType, type: InjectType) {
    return this.getOwnDependencies(target).some((d) => d.injectType === type);
  }
  static setDependencies({
    deps,
    type,
    target,
    paramIndex,
  }: {
    deps: ClassType[];
    target: ClassType;
    type: InjectType;
    paramIndex?: number;
  }) {
    const preDeps = this.getOwnDependencies(target);

    if (this.hasInjectType(target, "PARAMETER") && type === "CLASS") {
      throw new Error(
        `Dependencies are injecting by @Inject() as parameter and class decorator for \`class ${target.name}\`. Use one of them.`
      );
    }

    if (
      (this.hasInjectType(target, "CLASS") && type === "CLASS_METADATA") ||
      (type === "CLASS" && this.hasInjectType(target, "CLASS_METADATA"))
    ) {
      console.warn(
        `Dependencies are automatically detected for \`class ${target.name}\`. Remove @Inject(...)`
      );
    }

    if (type === "CLASS" || type === "CLASS_METADATA") {
      Reflect.defineMetadata(
        this.DEP_TYPES,
        deps.map<ConstructorDependency>((classDepType, index) => {
          const paramDep = preDeps?.find(
            (d) => d.paramIndex === index && d.injectType === "PARAMETER"
          );
          return (
            paramDep || { injectType: type, paramIndex: index, type: classDepType }
          );
        }),
        target
      );
    } else {
      const paramDep = preDeps?.find((d) => d.paramIndex === paramIndex);
      if (paramDep) {
        paramDep.type = deps[0];
        paramDep.injectType = "PARAMETER";
      } else {
        Reflect.defineMetadata(
          this.DEP_TYPES,
          (preDeps || []).concat({
            type: deps[0],
            paramIndex: paramIndex!,
            injectType: type,
          }),
          target
        );
      }
    }
  }

  private static getOwnDependencies(target: ClassType): ConstructorDependency[] {
    return (
      (Reflect.getOwnMetadata(this.DEP_TYPES, target) ||
        []) as ConstructorDependency[]
    ).sort((a, b) => a.paramIndex - b.paramIndex);
  }

  static getDependenciesDecoratedWith(
    target: ClassType | null,
    decoratedWith: DecoratedWith
  ): ConstructorDependency[] {
    if (target) {
      const isDecorated =
        decoratedWith === "STORE"
          ? StoreMetadataUtils.is(target)
          : decoratedWith === "STORE_PART"
          ? StorePartMetadataUtils.is(target)
          : InjectableMetadataUtils.is(target);

      const ownDeps = this.getOwnDependencies(target);
      if (ownDeps?.length > 0 && isDecorated) {
        return ownDeps;
      } else {
        return this.getDependenciesDecoratedWith(
          Reflect.getPrototypeOf(target) as ClassType,
          decoratedWith
        );
      }
    }

    return [];
  }
}

interface ConstructorDependency {
  type: ClassType;
  paramIndex: number;
  injectType: InjectType;
}

export type DecoratedWith = "STORE" | "STORE_PART" | "INJECTABLE";
type InjectType = "CLASS" | "CLASS_METADATA" | "PARAMETER";
