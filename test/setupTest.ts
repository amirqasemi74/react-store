import crypto from "@trust/webcrypto";
import "reflect-metadata";

Reflect.set(window, "crypto", crypto);

window.console.error = () => void 0;
