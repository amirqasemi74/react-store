import objectPath from "object-path";
import Store from "src/react/store";

const getDepsValues = (store: Store, effectKey: PropertyKey) => {
  const effect = store.getEffect(effectKey)!;
  const depsValues = effect.deps.map((path) =>
    objectPath.get(store.pureInstance, path)
  );
  let isDepsEqual = true;
  for (let i = 0; i < depsValues.length; i++) {
    if (!Object.is(depsValues[i], effect.depsValues[i])) {
      isDepsEqual = false;
      break;
    }
  }
  return {
    isDepsEqual,
    depsValues,
  };
};

export default getDepsValues;
