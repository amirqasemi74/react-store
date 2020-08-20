import Store from "../store";
import usedContextesHandler from "./contextHandler";
import effectHandler from "./effectHandler";
import propsHandler from "./propsHandler";

const handlers = [usedContextesHandler, propsHandler, effectHandler];

const registerHandlers = (store: Store, props: object) =>
  handlers.forEach((handler) => handler(store, props));

export default registerHandlers;
