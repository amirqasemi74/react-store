import Store from "src/react/store";
import { GetSetStack } from "./runEffect";

const dependeciesExtarctor = (getSetStack: GetSetStack[], store: Store) => {
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
        //???
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

export default dependeciesExtarctor;
