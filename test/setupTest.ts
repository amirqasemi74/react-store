import "reflect-metadata";
import crypto from "@trust/webcrypto";

Reflect.set(window, "crypto", crypto);
