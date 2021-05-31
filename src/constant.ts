export const STORE_USED_CONTEXTES = Symbol("STORE_USED_CONTEXTES");
export const ARRAY_OBSERVABILITY_DEPTH = Infinity;
export const OBJECT_OBSERVABILITY_DEPTH = Infinity;
export const STORE_ADMINISTRATION = Symbol("STORE_ADMINISTRATION");

export const AsyncFucntion = Object.getPrototypeOf(
  async function () {}
).constructor;
