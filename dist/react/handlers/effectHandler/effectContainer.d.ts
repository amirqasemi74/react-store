export default abstract class EffectsContainer {
    private effects;
    storeEffet(effectKey: PropertyKey, effect: Effect): void;
    getEffect(effectKey: PropertyKey): Effect | undefined;
}
interface Effect {
    deps: string[];
    depsValues: any[];
    isCalledOnce: boolean;
    clearEffect?: (() => void) | null;
}
export {};
