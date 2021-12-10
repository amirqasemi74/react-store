export function Observable(): ClassDecorator {
  return function (target: any) {
    Reflect.defineMetadata(IS_OBSERVABLE, true, target);
  };
}

const IS_OBSERVABLE = Symbol("IS_OBSERVABLE");

export const isObservable = (target: any) =>
  !!Reflect.hasMetadata(IS_OBSERVABLE, target);
