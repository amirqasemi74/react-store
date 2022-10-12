import { StoreAdministrator } from "./storeAdministrator";
import { useContext } from "react";
import {
  ReactApplicationContext,
  StoreAdministratorReactContext,
} from "src/appContext";
import { getClassDependenciesType } from "src/decorators/inject";
import { WireMetadata } from "src/decorators/wire";
import { ReactStore } from "src/reactStore";
import { ClassType } from "src/types";
import { decoratorsMetadataStorage } from "src/utils/decoratorsMetadataStorage";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StoreStorePartsManager {
  storeParts = new Map<PropertyKey, StoreAdministrator>();

  constructor(private storeAdmin: StoreAdministrator) {}

  private get storePartWires() {
    return decoratorsMetadataStorage
      .get<WireMetadata>("Wire", this.storeAdmin.type)
      .filter(
        (wire) => decoratorsMetadataStorage.get("StorePart", wire.type).length
      );
  }

  createInstances() {
    this.storePartWires.forEach((wire) => {
      const StorePart = wire.type as ClassType;
      this.storeAdmin.hooksManager.reactHooks.add({
        when: "BEFORE_INSTANCE",
        hook: () => this.resolveStorePartsDeps(StorePart),
        result: (depsValue: unknown[]) => {
          if (!this.storeParts.has(wire.propertyKey)) {
            const instance = new StorePart(...depsValue);
            const storePartAdmin = new StoreAdministrator(StorePart);
            storePartAdmin.setInstance(instance);
            this.storeParts.set(wire.propertyKey, storePartAdmin);
          }
        },
      });
    });
  }

  private resolveStorePartsDeps(storePartType: ClassType) {
    // STORE_PART
    const storePartDepTypes = useFixedLazyRef(() =>
      getClassDependenciesType(storePartType)
    );

    const storePartDepsContexts = useFixedLazyRef(() => {
      const storeDepsContexts = new Map<ClassType, StoreAdministratorReactContext>();
      const appContext = ReactStore.container.resolve(ReactApplicationContext);

      storePartDepTypes.forEach((depType) => {
        if (depType === storePartType) {
          throw new Error(
            `You can't inject ${storePartType.name} into ${storePartType.name}!`
          );
        }
        const storeContext = appContext.getStoreReactContext(depType);
        if (!storeContext) {
          return;
        }
        storeDepsContexts.set(depType, storeContext);
      });

      return Array.from(storeDepsContexts.entries());
    });

    const storPartStoricalDepsValues = storePartDepsContexts.map(
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

    return useFixedLazyRef(() =>
      storePartDepTypes.map(
        (depType) =>
          storPartStoricalDepsValues.find((sdv) => sdv.storeAdmin.type === depType)
            ?.storeAdmin.instance ||
          ReactStore.container.resolve(depType as ClassType)
      )
    );
  }

  register() {
    this.storeParts.forEach((adm, propertyKey) => {
      this.storeAdmin.instance[propertyKey] = adm.instance;
      adm.injectedInTos.add(this.storeAdmin);
      // TODO: turn on can be auto on add injected
    });
  }
}
