import { ReactApplicationContext } from "../appContext";
import { registerHandlers } from "../handlers/registerHandlers";
import { StoreAdministrator } from "./administrator/storeAdministrator";
import { EnhancedStoreFactory } from "./enhancedStoreFactory";
import { StorePropertyKey } from "./storePropertyKey";
import { useContext, useState } from "react";
import { getFromContainer } from "src/container/container";
import { InjectMetadataUtils } from "src/container/decorators/inject";
import { ClassType } from "src/types";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StoreFactory {
  static create(StoreType: ClassType, props: any) {
    const EnhancedStoreType = useFixedLazyRef(() =>
      EnhancedStoreFactory.create(StoreType)
    );

    const deps = this.resolveStoreDeps(EnhancedStoreType);

    const store = useFixedLazyRef(() => {
      const store = new EnhancedStoreType(...deps);
      const storeAdmin = StoreAdministrator.get(store);

      // for example if we inject store A into other store B
      // if then injected store A change all store b consumer must be
      // notified to rerender base of their deps
      // so here we save store B ref in store A
      // to notify B if A changed
      deps
        .map(StoreAdministrator.get)
        .forEach((sourceStoreAdmin) =>
          sourceStoreAdmin?.injectedInTos.add(storeAdmin)
        );

      return store;
    });

    const storeAdmin = StoreAdministrator.get(store);
    this.registerUseStateForStore(storeAdmin);
    this.registerUseStateForStoreParts(storeAdmin);

    registerHandlers(storeAdmin, props);

    return { store, storeAdmin };
  }

  private static resolveStoreDeps(storeType: ClassType) {
    const storeDeps = useFixedLazyRef(() =>
      InjectMetadataUtils.getDependenciesDecoratedWith(storeType, "STORE")
    );

    const storeDepsContexts = useFixedLazyRef(() => {
      const storeDepsContexts = new Map<
        Function,
        React.Context<StoreAdministrator | null>
      >();
      const appContext = getFromContainer(ReactApplicationContext);

      // Find dependencies which is store type
      // then resolve them from context
      //TODO: for global stores
      storeDeps.forEach((dep) => {
        if (dep.type === storeType) {
          throw new Error(
            `You can't inject ${storeType.name} into ${storeType.name}!`
          );
        }
        const storeContext = appContext.getStoreReactContext(dep.type);
        if (!storeContext) {
          return;
        }
        storeDepsContexts.set(dep.type, storeContext);
      });

      return Array.from(storeDepsContexts.entries());
    });

    const storicalDepsValues = storeDepsContexts.map(([type, context]) => {
      const storeAdmin = useContext(context);
      if (!storeAdmin) {
        throw new Error(
          `${type.name} haven't been connected to the component tree!`
        );
      }
      return storeAdmin;
    });

    return useFixedLazyRef(() =>
      storeDeps.map(
        (dep) =>
          storicalDepsValues.find((sdv) => sdv.type === dep.type)?.instance ||
          getFromContainer(dep.type as ClassType)
      )
    );
  }

  private static registerUseStateForStore(storeAdmin: StoreAdministrator) {
    Array.from(storeAdmin.propertyKeysManager.propertyKeys.values()).forEach(
      StoreFactory.createUseStateForPropertyKey
    );
  }
  private static registerUseStateForStoreParts(storeAdmin: StoreAdministrator) {
    Array.from(storeAdmin.storePartsManager.storeParts.values()).forEach((sp) => {
      Array.from(sp.propertyKeysManager.propertyKeys.values()).forEach(
        this.createUseStateForPropertyKey
      );
      this.registerUseStateForStoreParts(sp);
    });
  }

  private static createUseStateForPropertyKey(info: StorePropertyKey) {
    const [state, setState] = useState(() =>
      info.isPrimitive ? info.getValue("Store") : { $: info.getValue("Store") }
    );
    info.setValue(state, "State");
    info.reactSetState = setState;
  }
}

const appContext = getFromContainer(ReactApplicationContext);
