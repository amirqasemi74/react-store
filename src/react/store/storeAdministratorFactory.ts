import { useContext } from "react";
import { getFromContainer } from "src/container/container";
import { getConstructorDependencyTypes } from "src/decorators/inject";
import { ClassType } from "src/types";
import { useFixedLazyRef } from "src/utils/useLazyRef";
import { ReactApplicationContext } from "../appContext";
import { StoreAdministrator } from "./administrator/storeAdministrator";

export class StoreAdministratorFactory {
  static create(StoreType: ClassType) {
    const deps = this.resolveStoreDeps(StoreType);

    return useFixedLazyRef(() => {
      const store = new StoreType(...deps);
      const storeAdministrator = StoreAdministrator.get(store);

      // for example if we inject store A into other store B
      // if then injected store A change all store b consumer must be
      // notified to rerender base of their deps
      // so here we save store B ref in store A
      // to notify B if A changed
      deps
        .map(StoreAdministrator.get)
        .forEach((sourceStoreAdmin) =>
          sourceStoreAdmin?.injectedInTos.add(storeAdministrator)
        );

      return storeAdministrator;
    });
  }

  private static resolveStoreDeps(storeType: ClassType) {
    const storeDeps = getConstructorDependencyTypes(storeType);
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

      return storeDepsContexts;
    });

    const storicalDepsValues = Array.from(storeDepsContexts.entries()).map(
      ([type, context]) => {
        const storeAdmin = useContext(context);
        if (!storeAdmin) {
          throw new Error(
            `${type.name} haven't been connected to the component tree!`
          );
        }
        return storeAdmin;
      }
    );

    return useFixedLazyRef(() => {
      return storeDeps.map(
        (dep) =>
          storicalDepsValues.find((sdv) => sdv.type === dep.type)?.instance ||
          getFromContainer(dep.type as ClassType)
      );
    });
  }
}
