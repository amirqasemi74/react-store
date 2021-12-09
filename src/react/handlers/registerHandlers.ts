import { StoreAdministrator } from "../store/administrator/storeAdministrator";
import { usedContextsHandler as usedContextsHandler } from "./usedContextsHandler";
import { effectHandler } from "./effects/effectHandler";
import { propsHandler } from "./propsHandler";

const handlers = [usedContextsHandler, propsHandler, effectHandler];

export const registerHandlers = (admin: StoreAdministrator, props: object) =>
  handlers.forEach((handler) => handler(admin, props));
