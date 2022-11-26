import { ReactStore } from "..";
import {
  ReactApplicationContext,
  StoreAdministratorReactContext,
} from "../appContext";
import { StoreAdministrator } from "./administrator/storeAdministrator";
import { useContext } from "react";
import { getClassDependenciesType } from "src/decorators/inject";
import { StorePartMetadata } from "src/decorators/storePart";
import { ClassType } from "src/types";
import { decoratorsMetadataStorage } from "src/utils/decoratorsMetadataStorage";
import { useFixedLazyRef } from "src/utils/useLazyRef";
import { useWillMount } from "src/utils/useWillMount";

export class StoreFactory {
  static create(
    StoreType: ClassType,
    renderContext: (relax?: boolean) => void,
    props?: object
  ) {
    const deps = this.resolveStoreDeps(StoreType);

    const storeAdmin = useFixedLazyRef(
      () => new StoreAdministrator(StoreType, renderContext)
    );

    useWillMount(() => {
      storeAdmin.createInstance(deps);
    });

    this.runHooks(storeAdmin, props);

    return storeAdmin;
  }

  /**
   * *********************** Dependency Injection *******************
   */

  private static resolveStoreDeps(storeType: ClassType): unknown[] {
    // STORE
    const storeDepsTypes = useFixedLazyRef(() =>
      getClassDependenciesType(storeType)
    );

    /**
     * Resolve Storical Dependencies using `useContext`
     */
    const storeDepsContexts = useFixedLazyRef(() => {
      const storeDepsContexts = new Map<ClassType, StoreAdministratorReactContext>();
      const appContext = ReactStore.container.resolve(ReactApplicationContext);

      // Find dependencies which is store type
      // then resolve them from context
      storeDepsTypes.forEach((depType) => {
        if (depType === storeType) {
          throw new Error(
            `You can't inject ${storeType.name} into ${storeType.name}!`
          );
        }

        const storeContext = appContext.getStoreReactContext(depType);
        if (storeContext) {
          storeDepsContexts.set(depType, storeContext);
        }
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


    /**
     * Resolve Store Part dependencies
     */
    const storeStorePartTypes = useFixedLazyRef(() =>
      storeDepsTypes.filter(
        (depType) =>
          !!decoratorsMetadataStorage.get<StorePartMetadata>("StorePart", depType)
            .length
      )
    );

    const storeStorePartDepsValues = storeStorePartTypes.map((storePartType) => ({
      storePartType,
      deps: this.resolveStoreDeps(storePartType),
    }));

    return useFixedLazyRef(() =>
      storeDepsTypes.map((depType) => {
        const store = storicalDepsValues.find(
          (sdv) => sdv.storeAdmin.type === depType
        )?.storeAdmin.instance;
        if (store) {
          return store;
        }

        const isStorePart = storeStorePartTypes.includes(depType);
        if (isStorePart) {
          const deps = storeStorePartDepsValues.find(
            (e) => e.storePartType === depType
          )!.deps;
          const storePartAdmin = new StoreAdministrator(depType);
          storePartAdmin.createInstance(deps);
          return storePartAdmin.instance;
        }

        return ReactStore.container.resolve(depType as ClassType);
      })
    );
  }

  /**
   * ************** Hooks *************
   */
  static runHooks(storeAdmin: StoreAdministrator, props?: object) {
    storeAdmin.storePartAdministrators.forEach(this.runHooks.bind(this));
    Array.from(storeAdmin.hooksManager.reactHooks.values()).forEach(
      ({ hook, result }) => {
        const res = hook(storeAdmin, props);
        result?.(res);
      }
    );
  }
}
