import { InjectableMetadataUtils } from "./Injectable";
import { StoreMetadataUtils } from "./store";

export function Inject(...deps: any[]): any {
  return function (...decoArgs: any[]) {
    const target = decoArgs[0];
    const injectType: InjectType =
      decoArgs.length === 1 ? "CLASS" : "PARAMETER";
    const preInjectType = InjectMetadataUtils.getType(target);

    if (preInjectType && preInjectType !== injectType) {
      throw new Error(
        `Dependencies are injecting by @Inject() as parameter and class decorator for ${target.name}. Use one of them.`
      );
    }
    InjectMetadataUtils.setType(target, injectType);
    InjectMetadataUtils.setDependencies(injectType, target, deps, decoArgs[2]);
  };
}

export class InjectMetadataUtils {
  private static readonly INJECT_TYPE = Symbol();
  private static readonly DEP_TYPES = Symbol();

  static setType(target: Function, type: InjectType) {
    Reflect.defineMetadata(this.INJECT_TYPE, type, target);
  }

  static getType(target: Function): InjectType | null {
    return Reflect.getOwnMetadata(this.INJECT_TYPE, target) || null;
  }

  static setDependencies(
    type: InjectType,
    target: Function,
    deps: any[],
    paramIndex?: number
  ) {
    if (type === "CLASS") {
      Reflect.defineMetadata(
        this.DEP_TYPES,
        deps
          .map<ConstructorDependency>((type, i) => ({
            type,
            paramIndex: i,
          }))
          .sort((a, b) => a.paramIndex - b.paramIndex),
        target
      );
    } else {
      const depTypes: ConstructorDependency[] =
        Reflect.getMetadata(this.DEP_TYPES, target) || [];

      Reflect.defineMetadata(
        this.DEP_TYPES,
        depTypes
          .concat({ type: deps[0], paramIndex: paramIndex! })
          .sort((a, b) => a.paramIndex - b.paramIndex),
        target
      );
    }
  }

  static getOwnDependencies(target: Function) {
    return Reflect.getOwnMetadata(this.DEP_TYPES, target);
  }

  static getDependenciesDecoratedWith(
    target: Function | null,
    decoratedWith: DecoratedWith
  ): ConstructorDependency[] {
    if (target) {
      const isDecorated =
        decoratedWith === "STORE"
          ? StoreMetadataUtils.is(target)
          : InjectableMetadataUtils.is(target);

      if (this.getOwnDependencies(target) && isDecorated) {
        return this.getOwnDependencies(target);
      } else {
        return this.getDependenciesDecoratedWith(
          Reflect.getPrototypeOf(target) as any,
          decoratedWith
        );
      }
    }

    return [];
  }
}

interface ConstructorDependency {
  paramIndex: number;
  type: Function;
}

type DecoratedWith = "STORE" | "INJECTABLE";
type InjectType = "CLASS" | "PARAMETER";
