import { StoreAdministration } from "../store/storeAdministration";
import { usedContextesHandler } from "./usedContextesHandler";
import { effectHandler } from "./effects/effectHandler";
import propsHandler from "./propsHandler";

const handlers = [usedContextesHandler, propsHandler, effectHandler];

export const registerHandlers = (
  storeAdministration: StoreAdministration,
  props: object
) => handlers.forEach((handler) => handler(storeAdministration, props));
