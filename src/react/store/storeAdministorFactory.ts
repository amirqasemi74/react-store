import { useContext } from "react";
import { getFromContainer } from "src/container/container";
import { getConstructorDependencyTypes } from "src/decorators/inject";
import { ClassType } from "src/types";
import { useLazyRef } from "src/utils/useLazyRef";
import { getStoreAdministrator } from "src/utils/utils";
import { ReactApplicationContext } from "../appContext";
import { StoreAdministrator } from "./storeAdministrator";

export class StoreAdministratorFactory {
  static create(StoreType: ClassType) {
    const deps = this.resolveStoreDeps(StoreType);

    return useLazyRef(() => {
      const store = new StoreType(...deps);
      const storeAdministrator = getStoreAdministrator(store)!;

      // for example if we inject store A  in to other store B
      // if then injected store A change all store b consumer must be
      // notified to rerender base of their deps
      // so here we save store B ref in store A
      // to nofify B if A changed
      storeAdministrator.turnOffRender();
      deps.map(getStoreAdministrator).forEach((storeAdmin) => {
        storeAdmin?.turnOffRender();
        storeAdmin?.addInjectedInto(storeAdministrator);
        storeAdmin?.turnOnRender();
      });
      storeAdministrator.turnOnRender();
      return storeAdministrator;
    }).current;
  }

  private static resolveStoreDeps(storeType: ClassType) {
    const storeDepsContextes = useLazyRef(() => {
      const storeDeps = getConstructorDependencyTypes(storeType);
      const storeDepsContextes = new Map<
        Function,
        React.Context<StoreAdministrator | null>
      >();
      const appContext = getFromContainer(ReactApplicationContext);

      // Find dependecies which is store type
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
        storeDepsContextes.set(dep.type, storeContext);
      });

      return storeDepsContextes;
    }).current;

    const storicalDepsValues = Array.from(storeDepsContextes.entries()).map(
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

    return useLazyRef(() => {
      const allStoreDepTypes = getConstructorDependencyTypes(storeType);
      return allStoreDepTypes.map(
        (dep) =>
          storicalDepsValues.find((sdv) => sdv.type === dep.type)?.instance ||
          getFromContainer(dep.type as ClassType)
      );
    }).current;
  }
}
