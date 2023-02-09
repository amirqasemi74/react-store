import { ClassType } from "src/types";

class DecoratorsMetadataStorage {
  private readonly decoratorsKeys = new Map<DecoratorType, symbol>();

  private getDecoratorKey(decoType: DecoratorType) {
    if (this.decoratorsKeys.has(decoType)) {
      return this.decoratorsKeys.get(decoType);
    } else {
      const key = Symbol();
      this.decoratorsKeys.set(decoType, key);
      return key;
    }
  }

  getOwn<T>(decoType: DecoratorType, target: ClassType): T[] {
    const KEY = this.getDecoratorKey(decoType);
    let mds = Reflect.getOwnMetadata(KEY, target);
    if (!mds) {
      mds = [];
      Reflect.defineMetadata(KEY, mds, target);
    }
    return mds;
  }

  get<T>(decoType: DecoratorType, target: ClassType): T[] {
    let mds = this.getOwn<T>(decoType, target);
    const parentMds = Reflect.getPrototypeOf(target) as ClassType;
    if (parentMds) {
      mds = mds.concat(this.get(decoType, parentMds));
    }

    return mds;
  }

  add<T>(decoType: DecoratorType, target: ClassType, metadata: T) {
    this.getOwn(decoType, target).push(metadata);
  }
}

type DecoratorType =
  | "Memo"
  | "Hook"
  | "Props"
  | "Store"
  | "Inject"
  | "Effect"
  | "PreFetch"
  | "StorePart"
  | "Unobserve"
  | "Observable"
  | "Injectable";

export const decoratorsMetadataStorage = new DecoratorsMetadataStorage();
