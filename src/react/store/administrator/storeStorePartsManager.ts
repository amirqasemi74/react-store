import { Property } from "./propertyKeys/property";
import { StoreAdministrator } from "./storeAdministrator";
import { useContext } from "react";
import { getFromContainer } from "src/container/container";
import { InjectMetadataUtils } from "src/container/decorators/inject";
import { StorePartMetadataUtils } from "src/decorators/storePart";
import { WireMetadataUtils } from "src/decorators/wire";
import { ReactApplicationContext } from "src/react/appContext";
import { ClassType } from "src/types";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StoreStorePartsManager {
  storeParts = new Map<PropertyKey, StoreAdministrator>();

  constructor(private storeAdmin: StoreAdministrator) {}

  private get storePartWires() {
    return WireMetadataUtils.getAll(this.storeAdmin.type).filter((wire) =>
      StorePartMetadataUtils.is(wire.type)
    );
  }

  createInstances() {
    const initiatedStorePart = new Set<PropertyKey>();
    this.storePartWires.forEach((wire) => {
      const StorePart = wire.type as ClassType;
      this.storeAdmin.hooksManager.reactHooks.add({
        when: "BEFORE_INSTANCE",
        hook: () => this.resolveStorePartsDeps(StorePart),
        result: (depsValue: unknown[]) => {
          if (!initiatedStorePart.has(wire.propertyKey)) {
            const instance = new StorePart(...depsValue);
            const storePartAdmin = new StoreAdministrator(StorePart);
            storePartAdmin.setInstance(instance);
            this.storeAdmin.propertyKeysManager.propertyKeys.set(
              wire.propertyKey,
              new Property(instance, true)
            );
            initiatedStorePart.add(wire.propertyKey);
          }
        },
      });
    });
  }

  private resolveStorePartsDeps(storePartType: ClassType) {
    const storePartDepTypes = useFixedLazyRef(() =>
      InjectMetadataUtils.getDependenciesDecoratedWith(storePartType, "STORE_PART")
    );

    const storePartDepsContexts = useFixedLazyRef(() => {
      const storeDepsContexts = new Map<
        ClassType,
        React.Context<StoreAdministrator | null>
      >();
      const appContext = getFromContainer(ReactApplicationContext);

      storePartDepTypes.forEach((dep) => {
        if (dep.type === storePartType) {
          throw new Error(
            `You can't inject ${storePartType.name} into ${storePartType.name}!`
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
        (dep) =>
          storPartStoricalDepsValues.find((sdv) => sdv.type === dep.type)
            ?.instance || getFromContainer(dep.type as ClassType)
      )
    );
  }

  register() {
    this.storePartWires.forEach(({ propertyKey }) => {
      const value = this.storeAdmin.propertyKeysManager.propertyKeys
        .get(propertyKey)
        ?.getValue("Store") as object;
      this.storeAdmin.instance[propertyKey] = value;
      const storePartAdmin = StoreAdministrator.get(value);
      storePartAdmin.injectedInTos.add(this.storeAdmin);
      this.storeParts.set(propertyKey, storePartAdmin);
    });
  }
}
