export const STORE_USED_CONTEXTS = Symbol("STORE_USED_CONTEXTS");
export const STORE_ADMINISTRATION = Symbol("STORE_ADMINISTRATION");
export const IS_PROXIED = Symbol("IS_PROXIED");

export const AsyncFunction = Object.getPrototypeOf(
  async function () {}
).constructor;
