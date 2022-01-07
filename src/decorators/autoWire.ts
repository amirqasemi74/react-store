import { Wire } from "..";

export function AutoWire(): PropertyDecorator {
  return function (target, propertyKey) {
    const type = Reflect.getOwnMetadata("design:type", target, propertyKey);
    if (!type) {
      throw new Error(
        `AutoWire for ${
          target.constructor.name
        }.${propertyKey.toString()} can't detect type. use \`@Wire(...) instead.\'`
      );
    }
    Wire(type)(target, propertyKey);
  };
}
