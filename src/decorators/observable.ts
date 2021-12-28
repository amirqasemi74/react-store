export function Observable(): ClassDecorator {
  return function (target: Function) {
    ObservableMetadataUtils.set(target);
  };
}

export class ObservableMetadataUtils {
  private static readonly KEY = Symbol();

  static set(target: Function) {
    Reflect.defineMetadata(this.KEY, true, target);
  }

  static is(target: Function) {
    return !!Reflect.hasOwnMetadata(this.KEY, target);
  }
}
