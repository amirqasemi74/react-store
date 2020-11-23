import EffectsContainer from "./handlers/effectHandler/effectContainer";
import ServiceInfo from "./handlers/effectHandler/serviceInfo";
export default class StoreAdministration extends EffectsContainer {
    id: string;
    constructorType: Function;
    pureInstance: any;
    instance: any;
    instancePropsValue: Map<string | number | symbol, any>;
    consumers: StoreConsumer[];
    servicesInfo: Map<string | number | symbol, ServiceInfo>;
    private injectedIntos;
    private isRenderAllow;
    init({ id, instance }: {
        id: string;
        instance: object;
    }): void;
    private initServiceEffectContainers;
    turnOffRender(): void;
    turnOnRender(): void;
    renderConsumers(): void;
    addInjectedInto({ propertyKey, storeAdministration }: StoreInjectedInto): void;
}
interface StoreConsumer {
    render: () => void;
}
interface StoreInjectedInto {
    storeAdministration: StoreAdministration;
    propertyKey: PropertyKey;
}
export {};
