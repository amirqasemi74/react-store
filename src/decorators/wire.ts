import { ClassType } from "src/types";

export function Wire(type: Function): PropertyDecorator {
  return function (target, propertyKey) {
    WireMetadataUtils.set(target.constructor, propertyKey, type);
  };
}

export class WireMetadataUtils {
  private static readonly KEY = Symbol();

  static set(target: Function, propertyKey: PropertyKey, type: Function) {
    const wires = this.getAllOwn(target);
    wires.push({ propertyKey, type });
    Reflect.defineMetadata(this.KEY, wires, target);
  }

  static getAllOwn(target: Function): WireDetail[] {
    return Reflect.getOwnMetadata(this.KEY, target) || [];
  }

  static getAll(target: Function): WireDetail[] {
    let wires = this.getAllOwn(target);
    const parentClass = Reflect.getPrototypeOf(target) as ClassType;
    if (parentClass) {
      wires = wires.concat(this.getAll(parentClass));
    }
    return wires;
  }

  static is(target: Function, propertyKey: PropertyKey) {
    const wires = this.getAll(target);
    return wires.some(({ propertyKey: _p }) => _p === propertyKey);
  }
}

interface WireDetail {
  type: Function;
  propertyKey: PropertyKey;
}
