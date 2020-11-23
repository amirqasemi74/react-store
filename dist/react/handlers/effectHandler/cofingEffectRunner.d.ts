import { EffectMetaData } from "../../../decorators/effect";
import EffectsContainer from "./effectContainer";
interface EffectRunnerOptions {
    container: EffectsContainer;
    metaData: EffectMetaData[];
    context: object;
    pureContext: object;
}
declare const cofingEffectRunner: ({ metaData, container, pureContext, context, }: EffectRunnerOptions) => void;
export default cofingEffectRunner;
