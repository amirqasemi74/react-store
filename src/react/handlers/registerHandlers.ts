import { StoreAdministrator } from "../store/administrator/storeAdministrator";
import { effectHandler } from "./effects/effectHandler";
import { propsHandler } from "./propsHandler";
import { usedContextsHandler } from "./usedContextsHandler";

const handlers = [usedContextsHandler, propsHandler, effectHandler];

export const registerHandlers = (admin: StoreAdministrator, props: object) =>
  handlers.forEach((handler) => handler(admin, props));
