import React, { Context, useEffect, useRef, useState } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import ReactAppContext from "../appContext";
import { STORE_REF } from "../../constant";
import registerHandlers from "../handlers";
import storeInjectionHandler from "../handlers/storeInjectionHandler";
import Store from "../store";

interface ProviderComponentProps {
  props?: any;
}

const buildProviderComponent = (
  TheContext: Context<Store | null>,
  StoreType: ClassType
): React.FC<ProviderComponentProps> => ({ children, props }) => {
  const [, setRenderKey] = useState(uid());
  const id = useRef(uid()).current;
  const appContext = getFromContainer(ReactAppContext);

  // Inject Contextual Store which has been mounted before
  const injectedStores = storeInjectionHandler(StoreType);
  const store = useRef(
    appContext.resolveStore({
      StoreType,
      id,
      type: "context",
      storeDeps: injectedStores,
    })
  ).current;

  // for example if we inject store A  in to other store B
  // if then injected store A change all store b consumer must be
  // notified to rerender base of their deps
  // so here we save store B ref in store A
  // to nofify B if A changed
  if (injectedStores.size) {
    store.turnOffRender();
    injectedStores.forEach((injectedStore) => {
      injectedStore.turnOffRender();
      for (const [propertyKey, value] of Object.entries<any>(
        store.pureInstance
      )) {
        if ((value[STORE_REF] as Store)?.id === injectedStore.id) {
          injectedStore.addInjectedInto({ store, propertyKey });
        }
      }
      injectedStore.turnOnRender();
    });
    store.turnOnRender();
  }

  useEffect(() => {
    store.consumers.push({ render: () => setRenderKey(uid()) });
  }, []);

  registerHandlers(store, props);

  return <TheContext.Provider value={store}>{children}</TheContext.Provider>;
};

export default buildProviderComponent;
