import StoreAdministration from "../storeAdministration";
import usedContextesHandler from "./contextHandler";
import effectHandler from "./effectHandler";
import propsHandler from "./propsHandler";

const handlers = [usedContextesHandler, propsHandler, effectHandler];

const registerHandlers = (
  storeAdministration: StoreAdministration,
  props: object
) => handlers.forEach((handler) => handler(storeAdministration, props));

export default registerHandlers;
