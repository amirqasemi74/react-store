import { ClassType } from "src/types";

export function Observable() {
  return function (target: ClassType) {
    ObservableMetadataUtils.set(target);
  } as ClassDecorator;
}

export class ObservableMetadataUtils {
  private static readonly KEY = Symbol();

  static set(target: ClassType) {
    Reflect.defineMetadata(this.KEY, true, target);
  }

  static is(target: ClassType) {
    return !!Reflect.hasOwnMetadata(this.KEY, target);
  }
}
