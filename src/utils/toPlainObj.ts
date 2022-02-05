import cloneDeep from "clone-deep";

export const toPlainObj = (obj: unknown) => cloneDeep(obj);
