import { useEffect } from "react";
import { EFFECTS } from "src/react/constant";
import Store from "src/react/store";
import proxyDeep from "./proxyDeep";
import objectPath from "object-path";

const effectHandler = (store: Store) => {
  const effects: PropertyKey[] =
    Reflect.get(store.constructorType, EFFECTS) || [];

  effects.forEach((effectKey) => {
    useEffect(() => {
      (() => {
        const getSetStack: GetSetStack[] = [];
        const context = proxyDeep({
          store,
          getSetStack,
        });
        const effect = store.getEffect(effectKey);

        if (effect?.isCalledOnce) {
          const despValue = effect.deps.map((path) =>
            objectPath.get(store.pureInstance, path)
          );

          let isDepsEqual = true;
          for (let i = 0; i < despValue.length; i++) {
            if (!Object.is(despValue[i], effect.preDepsValues[i])) {
              isDepsEqual = false;
              break;
            }
          }
          if (!isDepsEqual) {
            Promise.resolve(
              Reflect.apply(store.pureInstance[effectKey], context, [])
            ).then(() => {
              const deps = DependeciesExtarctor(getSetStack, store);
              store.storeEffet(effectKey, {
                deps,
                isCalledOnce: true,
                preDepsValues: despValue,
              });
            });
          }
        } else {
          Promise.resolve(
            Reflect.apply(store.pureInstance[effectKey], context, [])
          ).then(() => {
            const deps = DependeciesExtarctor(getSetStack, store);
            store.storeEffet(effectKey, {
              deps,
              isCalledOnce: true,
              preDepsValues: deps.map((path) =>
                objectPath.get(store.pureInstance, path)
              ),
            });
          });
        }
      })();
    });
  });
};

export const DependeciesExtarctor = (
  getSetStack: GetSetStack[],
  store: Store
) => {
  const temp = [...getSetStack];

  if (!temp.length) {
    return [];
  }
  const trace: { path: string; value: any }[] = [
    {
      path: `${temp[0].type}::${temp[0].propertyKey.toString()}`,
      value: temp.shift()?.value,
    },
  ];

  let i = 0;
  for (let item of temp) {
    if (item.type === "GET") {
      if (
        item.propertyKey in store.pureInstance &&
        item.value === store.pureInstance[item.propertyKey]
      ) {
        i++;
        trace.push({
          path: `GET::${item.propertyKey.toString()}`,
          value: item.value,
        });
      } else {
        trace[i] = {
          path: trace[i].path + `.${item.propertyKey.toString()}`,
          value: item.value,
        };
      }
    } else {
      const j = trace.findIndex((t) => t.value === item.target);
      if (j !== -1) {
        trace[j] = {
          path: (trace[j].path + `.${item.propertyKey.toString()}`).replace(
            "GET",
            "SET"
          ),
          value: item.value,
        };
      } else {
      }
    }
  }

  return Array.from(
    new Set(
      trace
        .filter(({ path }) => path.startsWith("GET::"))
        .map(({ path }) => path.replace("GET::", ""))
    )
  );
};

export interface GetSetStack {
  type: "SET" | "GET";
  target: any;
  propertyKey: PropertyKey;
  value: any;
}

export default effectHandler;
