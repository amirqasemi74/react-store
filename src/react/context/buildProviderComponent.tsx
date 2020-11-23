import React, { Context, useEffect, useRef, useState } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import ReactAppContext from "../appContext";
import { STORE_ADMINISTRATION } from "../../constant";
import registerHandlers from "../handlers";
import storeInjectionHandler from "../handlers/storeInjectionHandler";
import StoreAdministration from "../storeAdministration";
import useLazyRef from "src/utils/useLazyRef";

interface ProviderComponentProps {
  props?: any;
}

const buildProviderComponent = (
  TheContext: Context<StoreAdministration | null>,
  StoreType: ClassType
): React.FC<ProviderComponentProps> => ({ children, props }) => {
  const [, setRenderKey] = useState(() => uid());
  const id = useLazyRef(() => uid()).current;
  const appContext = getFromContainer(ReactAppContext);

  // Inject Contextual Store which has been mounted before
  const injectedStores = storeInjectionHandler(StoreType);

  const storeAdministration = useLazyRef(() =>
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
    storeAdministration.turnOffRender();
    injectedStores.forEach((injectedStore) => {
      injectedStore.turnOffRender();
      for (const [propertyKey, value] of Object.entries<any>(
        storeAdministration.pureInstance
      )) {
        if (
          (value?.[STORE_ADMINISTRATION] as StoreAdministration)?.id ===
          injectedStore.id
        ) {
          injectedStore.addInjectedInto({ storeAdministration, propertyKey });
        }
      }
      injectedStore.turnOnRender();
    });
    storeAdministration.turnOnRender();
  }

  useEffect(() => {
    const render = () => setRenderKey(uid());
    storeAdministration.consumers.push({ render });
    return () => {
      storeAdministration.consumers = storeAdministration.consumers.filter(
        (cnsr) => cnsr.render !== render
      );
    };
  }, []);

  registerHandlers(storeAdministration, props);

  return (
    <TheContext.Provider value={storeAdministration}>
      {children}
    </TheContext.Provider>
  );
};

export default buildProviderComponent;
