import {
  ReactApplicationContext,
  StoreAdministratorReactContext,
} from "../appContext";
import { StoreAdministratorReactHooks } from "./administrator/hooksManager";
import { StoreAdministrator } from "./administrator/storeAdministrator";
import { useContext } from "react";
import { getFromContainer } from "src/container/container";
import { InjectMetadataUtils } from "src/container/decorators/inject";
import { ClassType } from "src/types";
import { useFixedLazyRef } from "src/utils/useLazyRef";
import { useWillMount } from "src/utils/useWillMount";

export class StoreFactory {
  static create(
    StoreType: ClassType,
    renderContext: (relax?: boolean) => void,
    props?: object
  ) {
    // Has React.UseContext
    // So must be in render
    const deps = this.resolveStoreDeps(StoreType);

    const storeAdmin = useFixedLazyRef(() => {
      const storeAdmin = new StoreAdministrator(StoreType, renderContext);
      // for example if we inject store A into other store B
      // if then injected store A change all store b consumer must be
      // notified to rerender base of their deps
      // so here we save store B ref in store A
      // to notify B if A changed
      deps.map(StoreAdministrator.get).forEach((sourceStoreAdmin) => {
        sourceStoreAdmin?.injectedInTos.add(storeAdmin);
      });

      return storeAdmin;
    });

    //Store Part will init here
    //So must be come first
    this.runHooks("BEFORE_INSTANCE", storeAdmin, props);
    useWillMount(() => {
      storeAdmin.setInstance(new StoreType(...deps));
    });
    this.runHooks("AFTER_INSTANCE", storeAdmin, props);

    return storeAdmin;
  }

  /**
   * *********************** Dependency Injection *******************
   */
  //TODO: merge with store part resolve deps
  private static resolveStoreDeps(storeType: ClassType) {
    const storeDeps = useFixedLazyRef(() =>
      InjectMetadataUtils.getDependenciesDecoratedWith(storeType, "STORE")
    );

    const storeDepsContexts = useFixedLazyRef(() => {
      const storeDepsContexts = new Map<ClassType, StoreAdministratorReactContext>();
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
          storicalDepsValues.find((sdv) => sdv.storeAdmin.type === dep.type)
            ?.storeAdmin.instance || getFromContainer(dep.type as ClassType)
      )
    );
  }

  /**
   * ************** Hooks *************
   */
  static runHooks(
    when: StoreAdministratorReactHooks["when"],
    storeAdmin: StoreAdministrator,
    props?: object
  ) {
    Array.from(storeAdmin.storePartsManager.storeParts.values()).forEach((spa) =>
      this.runHooks(when, spa, props)
    );
    Array.from(storeAdmin.hooksManager.reactHooks.values())
      .filter(({ when: _when }) => _when === when)
      .forEach(({ hook, result }) => {
        const res = hook(storeAdmin, props);
        result?.(res);
      });
  }
}
