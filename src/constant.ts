export const STORE_USED_CONTEXTS = Symbol("STORE_USED_CONTEXTS");
export const ARRAY_OBSERVABILITY_DEPTH = Infinity;
export const OBJECT_OBSERVABILITY_DEPTH = Infinity;
export const STORE_ADMINISTRATION = Symbol("STORE_ADMINISTRATION");

export const AsyncFunction = Object.getPrototypeOf(
  async function () {}
).constructor;
