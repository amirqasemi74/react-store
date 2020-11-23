import EffectsContainer from "./effectContainer";
interface RunEffectArgs {
    container: EffectsContainer;
    context: object;
    pureContext: object;
    effectKey: PropertyKey;
    depsValues?: any[];
}
declare const runEffect: ({ container, effectKey, context: _context, pureContext, depsValues, }: RunEffectArgs) => void;
export default runEffect;
