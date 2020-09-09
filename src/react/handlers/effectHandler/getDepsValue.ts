import objectPath from "object-path";
import Store from "src/react/store";

const getDepsValues = (store: Store, effectKey: PropertyKey) => {
  const effect = store.getEffect(effectKey)!;
  const depsValues = effect.deps.map((path) =>
    objectPath.get(store.pureInstance, path)
  );
  return depsValues;
};

export default getDepsValues;
