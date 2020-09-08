import { STORE_REF } from "src/constant";
import Store from "src/react/store";

const dependencyExtarctor = (
  getSetLogs: GetSetLog[],
  store: Store,
  type: GetSet = "GET"
) => {
  getSetLogs = [...getSetLogs];
  if (!getSetLogs.length) {
    return [];
  }
  const getSetItems: GetSetItem[] = [];
  let i = -1;

  for (const index in getSetLogs) {
    const { propertyKey, target, value, type } = getSetLogs[index];
    switch (type) {
      case "GET": {
        // reaching direct store property key

        if (propertyKey in store.pureInstance) {
          i++;
          getSetItems.push({
            path: `GET::${propertyKey.toString()}`,
            value,
          });
        } else {
          // follow chain
          // chain is continuing
          if (
            getSetItems[i].value === target ||
            (!!target[STORE_REF] &&
              !!getSetItems[i].value[STORE_REF] &&
              target[STORE_REF] === getSetItems[i].value[STORE_REF])
          ) {
            getSetItems[i] = {
              path: `${getSetItems[i].path}.${propertyKey.toString()}`,
              value,
            };
          } else {
            // chain breaks
            i++;
            getSetItems.push({
              path: `GET::${findChain({
                getSetLogs,
                target,
                upToIndex: Number(index),
              })?.toString()}.${propertyKey.toString()}`,
              value,
            });
          }
        }
        break;
      }
      case "SET": {
        const j = getSetItems.findIndex((t) => t.value === target);
        const z = getSetLogs.findIndex((t) => t.value === target);

        if (j !== -1) {
          getSetItems[j] = {
            path: `${getSetItems[j].path}.${propertyKey.toString()}`.replace(
              "GET",
              "SET"
            ),
            value,
          };
        } else if (z !== -1) {
          getSetItems[++i] = {
            path: `SET::${getSetLogs[
              z
            ].propertyKey.toString()}.${propertyKey.toString()}`,
            value,
          };
        } else if (propertyKey in store.pureInstance) {
          i++;
          getSetItems.push({
            path: `SET::${propertyKey.toString()}`,
            value,
          });
        }
        break;
      }
    }
  }

  // Deps path maybe duplicated due to developer deps usage
  // So remove duplicate for better performance
  return Array.from(
    new Set(
      getSetItems
        .filter(({ path }) => path.startsWith(`${type}::`))
        .map(({ path }) => path.replace(`${type}::`, ""))
    )
  );
};

const findChain = ({
  upToIndex,
  getSetLogs,
  target: initTarget,
}: {
  getSetLogs: GetSetLog[];
  upToIndex: number;
  target: any;
}) => {
  let chain = "";
  let target = initTarget;
  for (let i = upToIndex; i >= 0; i--) {
    if (target === getSetLogs[i].value) {
      chain = chain
        ? `${getSetLogs[i].propertyKey.toString()}.${chain}`
        : `${getSetLogs[i].propertyKey.toString()}`;
      target = getSetLogs[i].target;
    }
  }
  return chain;
};

export type GetSet = "GET" | "SET";

export interface GetSetLog {
  type: GetSet;
  target: any;
  propertyKey: PropertyKey;
  value: any;
}

interface GetSetItem {
  path: string;
  value: any;
}

export default dependencyExtarctor;
