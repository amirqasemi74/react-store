import crypto from "@trust/webcrypto";
import "reflect-metadata";

Reflect.set(window, "crypto", crypto);
