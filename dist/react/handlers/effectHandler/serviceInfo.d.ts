import EffectsContainer from "./effectContainer";
export default class ServiceInfo extends EffectsContainer {
    context: object;
    pureContext: object;
    constructor({ context, pureContext }: ConstructorArgs);
}
interface ConstructorArgs {
    context: object;
    pureContext: object;
}
export {};
