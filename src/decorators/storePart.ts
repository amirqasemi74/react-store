const STORE_PART_OPTIONS = Symbol("STORE_PART_OPTIONS");

/**
 * ******************* Decorator *********************
 */
export function StorePart(): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(STORE_PART_OPTIONS, {}, target);
  };
}

/**
 * ********************* Utils ************************
 */
export const isStorePart = (target: Function) => {
  return !!Reflect.getMetadata(STORE_PART_OPTIONS, target);
};
