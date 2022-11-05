import { StoreAdministrator } from "../storeAdministrator";
import { ObservableProperty } from "./observableProperty";
import { UnobservableProperty } from "./unobservableProperty";
import { useState } from "react";
import { InjectableMetadata } from "src/decorators/Injectable";
import { HookMetadata } from "src/decorators/hook";
import { PropsMetadata } from "src/decorators/props";
import { StoreMetadata } from "src/decorators/store";
import { StorePartMetadata } from "src/decorators/storePart";
import { UnobserveMetadata } from "src/decorators/unobserve";
import { deepUnproxy } from "src/proxy/deepUnproxy";
import { decoratorsMetadataStorage } from "src/utils/decoratorsMetadataStorage";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StorePropertyKeysManager {
  readonly observablePropertyKeys = new Map<
    PropertyKey,
    ObservableProperty | UnobservableProperty
  >();

  private readonly unobservablePropertyKeys: Array<{
    isReadonly: boolean;
    onSet?: (pk: PropertyKey) => void;
    matcher: (pk: PropertyKey) => boolean;
  }> = [];

  constructor(private storeAdmin: StoreAdministrator) {
    // @Props
    this.unobservablePropertyKeys.push({
      isReadonly: true,
      matcher: (propertyKey) =>
        decoratorsMetadataStorage
          .get<PropsMetadata>("Props", storeAdmin.type)
          .some((pk) => pk === propertyKey),
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@Props()\`, so can't be mutated.`
        ),
    });

    // @Hook
    this.unobservablePropertyKeys.push({
      isReadonly: true,
      matcher: (propertyKey) =>
        decoratorsMetadataStorage
          .get<HookMetadata>("Hook", this.storeAdmin.type)
          .some((md) => md.propertyKey === propertyKey),
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@Hook(...)\`, so can't be mutated.`
        ),
    });

    // Injected Store Part
    this.unobservablePropertyKeys.push({
      isReadonly: true,
      matcher: (propertyKey) => {
        const type = getUnproxiedValue(
          this.storeAdmin.instance[propertyKey]
        )?.constructor;
        return (
          type &&
          decoratorsMetadataStorage.get<StorePartMetadata>("StorePart", type).length
        );
      },
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@StorePart(...)\`, so can't be mutated.`
        ),
    });

    // Injected injectable
    this.unobservablePropertyKeys.push({
      isReadonly: true,
      matcher: (propertyKey) => {
        const type = getUnproxiedValue(
          this.storeAdmin.instance[propertyKey]
        )?.constructor;
        return (
          type &&
          decoratorsMetadataStorage.get<InjectableMetadata>("Injectable", type)
            .length
        );
      },
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is an injected @Injectable() , so can't be mutated.`
        ),
    });

    // Injected Stores
    const storeMatcher = (propertyKey: PropertyKey) => {
      const type = getUnproxiedValue(
        this.storeAdmin.instance[propertyKey]
      )?.constructor;
      return (
        type && !!decoratorsMetadataStorage.get<StoreMetadata>("Store", type).length
      );
    };
    this.unobservablePropertyKeys.push({
      isReadonly: true,
      matcher: storeMatcher,
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is an injected store, so can't be mutated`
        ),
    });

    //@Unobserve
    decoratorsMetadataStorage
      .get<UnobserveMetadata>("Unobserve", storeAdmin.type)
      .forEach((pk) => {
        this.unobservablePropertyKeys.push({
          isReadonly: false,
          matcher: (_pk) => _pk === pk,
        });
      });
  }

  makeAllObservable() {
    Object.keys(this.storeAdmin.instance).forEach((propertyKey) => {
      const unobservablePK = this.unobservablePropertyKeys.find(({ matcher }) =>
        matcher(propertyKey)
      );
      const value = this.storeAdmin.instance[propertyKey];
      this.observablePropertyKeys.set(
        propertyKey,
        unobservablePK
          ? new UnobservableProperty(value, unobservablePK.isReadonly)
          : new ObservableProperty(this.storeAdmin, value)
      );

      // Define setter and getter
      // to intercept this props getting and
      // return proxied value
      Object.defineProperty(this.storeAdmin.instance, propertyKey, {
        enumerable: true,
        configurable: true,
        get: () => this.onGetPropertyKey(propertyKey),
        set: (value: unknown) => this.onSetPropertyKey(propertyKey, value),
      });
    });
  }

  private onGetPropertyKey(propertyKey: PropertyKey) {
    return this.observablePropertyKeys.get(propertyKey)?.getValue("Store");
  }

  /**
   * @param propertyKey
   * @param value
   * @param force to set props in props handler or developer hooks
   */
  onSetPropertyKey(propertyKey: PropertyKey, value: unknown, force?: boolean) {
    value = deepUnproxy(value);
    const info = this.observablePropertyKeys.get(propertyKey)!;

    const storeValueAndRenderIfNeed = () => {
      const preValue = info?.getValue("Store");
      info.setValue(value, "Store");
      const purePreValue = getUnproxiedValue(Object(preValue)) || preValue;
      if (purePreValue !== value) {
        this.storeAdmin.renderConsumers(force);
      }
    };

    if (info instanceof ObservableProperty) {
      info.isSetStatePending = true;
      storeValueAndRenderIfNeed();
      return true;
    }

    if (info instanceof UnobservableProperty) {
      if (force && info.isReadonly) {
        storeValueAndRenderIfNeed();
        return true;
      } else if (info.isReadonly) {
        this.unobservablePropertyKeys
          .find(({ matcher }) => matcher(propertyKey))
          ?.onSet?.(propertyKey);
        return false;
      } else {
        info.setValue(value);
      }
    }
  }

  hasPendingSetStates() {
    return Array.from(this.observablePropertyKeys.values()).some(
      (info) => info instanceof ObservableProperty && info.isSetStatePending
    );
  }

  doPendingSetStates() {
    this.observablePropertyKeys.forEach((info) => {
      if (info instanceof ObservableProperty && info.isSetStatePending) {
        info.reactSetState?.();
      }
    });
  }
  /**
   * *********************** Store UseStates ******************************
   */
  registerUseStates() {
    this.storeAdmin.hooksManager.reactHooks.add({
      hook: () => {
        const propertyKeysInfo = useFixedLazyRef(() =>
          Array.from(this.observablePropertyKeys.values()).filter(
            (info) => info instanceof ObservableProperty
          )
        ) as ObservableProperty[];

        propertyKeysInfo.forEach((info) => {
          const [state, setState] = useState(() =>
            info.isPrimitive ? info.getValue("Store") : { $: info.getValue("Store") }
          );
          info.setValue(state, "State");
          info.setReactSetState(setState);
        });
      },
    });
  }
}
