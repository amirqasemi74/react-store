interface EffectOptions {
    dequal?: boolean;
}
export interface EffectMetaData {
    propertyKey: PropertyKey;
    options: EffectOptions;
}
export declare function Effect(options?: EffectOptions): MethodDecorator;
export declare const getEffectsMetaData: (target: Function) => EffectMetaData[];
export {};
