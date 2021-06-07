export function uid() {
  const validChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let array = new Uint8Array(10);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((x) => validChars.charAt(x % validChars.length))
    .join("");
}
