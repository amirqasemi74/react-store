import { ClassType } from "src/types";

export function Wire(type: ClassType): PropertyDecorator {
  return function (target, propertyKey) {
    WireMetadataUtils.set(target.constructor as ClassType, propertyKey, type);
  };
}

export class WireMetadataUtils {
  private static readonly KEY = Symbol();

  static set(target: ClassType, propertyKey: PropertyKey, type: ClassType) {
    const wires = this.getAllOwn(target);
    wires.push({ propertyKey, type });
    Reflect.defineMetadata(this.KEY, wires, target);
  }

  static getAllOwn(target: ClassType): WireDetail[] {
    return Reflect.getOwnMetadata(this.KEY, target) || [];
  }

  static getAll(target: ClassType): WireDetail[] {
    let wires = this.getAllOwn(target);
    const parentClass = Reflect.getPrototypeOf(target) as ClassType;
    if (parentClass) {
      wires = wires.concat(this.getAll(parentClass));
    }
    return wires;
  }

  static is(target: ClassType, propertyKey: PropertyKey) {
    const wires = this.getAll(target);
    return wires.some(({ propertyKey: _p }) => _p === propertyKey);
  }
}

interface WireDetail {
  type: ClassType;
  propertyKey: PropertyKey;
}
