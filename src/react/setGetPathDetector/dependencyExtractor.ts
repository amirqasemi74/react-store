import Store from "src/react/store";
import { STORE_REF } from "src/react/constant";

const dependencyExtarctor = (
  getSetLogs: GetSetLog[],
  store: Store,
  type: GetSet = "GET"
) => {
  getSetLogs = [...getSetLogs];

  if (!getSetLogs.length) {
    return [];
  }

  // Final get or set path will save in getSetItem
  const getSetItems: GetSetItem[] = [
    {
      path: `${getSetLogs[0].type}::${getSetLogs[0].propertyKey.toString()}`,
      value: getSetLogs[0].value,
    },
  ];

  let i = 0;
  //first Log property key is always is direct store property key
  let currentDirectStorePropertyKey = getSetLogs.shift()?.propertyKey;

  for (const { propertyKey, target, value, type } of getSetLogs) {
    switch (type) {
      case "GET": {
        // reaching direct store property key
        if (
          propertyKey in store.pureInstance &&
          value === store.pureInstance[propertyKey]
        ) {
          i++;
          currentDirectStorePropertyKey = propertyKey;
          getSetItems.push({
            path: `GET::${propertyKey.toString()}`,
            value,
          });
        } else {
          // follow chain
          // chain is contiuing
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
            getSetItems.push({
              path: `GET::${currentDirectStorePropertyKey?.toString()}.${propertyKey.toString()}`,
              value,
            });
          }
        }
        break;
      }
      case "SET": {
        const j = getSetItems.findIndex((t) => t.value === target);
        if (j !== -1) {
          getSetItems[j] = {
            path: `${getSetItems[j].path}.${propertyKey.toString()}`.replace(
              "GET",
              "SET"
            ),
            value,
          };
        } else if (propertyKey in store.pureInstance) {
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
