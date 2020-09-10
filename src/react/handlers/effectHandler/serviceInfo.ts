import EffectsContainer from "./effectContainer";

export default class ServiceInfo extends EffectsContainer {
  context: object;

  pureContext: object;

  constructor({ context, pureContext }: ConstructorArgs) {
    super();
    this.context = context;
    this.pureContext = pureContext;
  }
}

interface ConstructorArgs {
  context: object;
  pureContext: object;
}
