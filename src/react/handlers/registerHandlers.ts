import { StoreAdministrator } from "../store/storeAdministrator";
import { usedContextesHandler } from "./usedContextesHandler";
import { effectHandler } from "./effects/effectHandler";
import propsHandler from "./propsHandler";

const handlers = [usedContextesHandler, propsHandler, effectHandler];

export const registerHandlers = (admin: StoreAdministrator, props: object) =>
  handlers.forEach((handler) => handler(admin, props));
