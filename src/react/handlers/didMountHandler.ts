import { useEffect } from "react";
import Store from "../store";

export default function didMountHandler(store: Store) {
  useEffect(() => {
    if (Reflect.has(store.instance, "didMount")) {
      Reflect.apply(store.instance.didMount, store.instance, []);
    }
  }, []);
}
