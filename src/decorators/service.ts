const SERVICE_OPTIONS = Symbol("SERVICE_OPTIONS");

/**
 * ******************* Decorator *********************
 */
export function Service(): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(SERVICE_OPTIONS, {}, target);
  };
}

/**
 * ********************* Utils ************************
 */
export const isService = (target: Function) => {
  return !!Reflect.getMetadata(SERVICE_OPTIONS, target);
};
