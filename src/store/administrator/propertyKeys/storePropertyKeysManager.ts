import { StoreAdministrator } from "../storeAdministrator";
import { ObservableProperty } from "./observableProperty";
import { ReadonlyProperty } from "./readonlyProperty";
import { useState } from "react";
import { HookMetadata } from "src/decorators/hook";
import { PropsMetadata } from "src/decorators/props";
import { WireMetadata } from "src/decorators/wire";
import { deepUnproxy } from "src/proxy/deepUnproxy";
import { decoratorsMetadataStorage } from "src/utils/decoratorsMetadataStorage";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StorePropertyKeysManager {
  readonly propertyKeys = new Map<
    PropertyKey,
    ObservableProperty | ReadonlyProperty
  >();

  private readonly readonlyPropertyKeys: Array<{
    matcher: (propertyKey: PropertyKey) => boolean;
    onSet: (propertyKey: PropertyKey) => void;
  }> = [];

  constructor(private storeAdmin: StoreAdministrator) {
    // @Props
    this.readonlyPropertyKeys.push({
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
    // @Wire
    this.readonlyPropertyKeys.push({
      matcher: (propertyKey) =>
        decoratorsMetadataStorage
          .get<WireMetadata>("Wire", this.storeAdmin.type)
          .some((md) => md.propertyKey === propertyKey),
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@Wire(...)\` or \`@AutoWire()\`, so can't be mutated.`
        ),
    });

    // @Hook
    this.readonlyPropertyKeys.push({
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

    // Injected injectable
    this.readonlyPropertyKeys.push({
      matcher: (propertyKey) => {
        const type = getUnproxiedValue(
          this.storeAdmin.instance[propertyKey]
        )?.constructor;
        return type && decoratorsMetadataStorage.get("Injectable", type).length;
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
      return type && !!decoratorsMetadataStorage.get("Store", type).length;
    };
    this.readonlyPropertyKeys.push({
      matcher: storeMatcher,
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is an injected store, so can't be mutated`
        ),
    });
  }

  makeAllObservable() {
    Object.keys(this.storeAdmin.instance).forEach((propertyKey) => {
      const isReadOnly = this.readonlyPropertyKeys.some(({ matcher }) =>
        matcher(propertyKey)
      );
      const value = this.storeAdmin.instance[propertyKey];
      this.propertyKeys.set(
        propertyKey,
        isReadOnly
          ? new ReadonlyProperty(value)
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
    return this.propertyKeys.get(propertyKey)?.getValue("Store");
  }

  /**
   * @param propertyKey
   * @param value
   * @param force to set props in props handler or developer hooks
   */
  onSetPropertyKey(propertyKey: PropertyKey, value: unknown, force?: boolean) {
    value = deepUnproxy(value);
    const info = this.propertyKeys.get(propertyKey)!;

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

    if (info instanceof ReadonlyProperty) {
      if (force) {
        storeValueAndRenderIfNeed();
        return true;
      } else {
        this.readonlyPropertyKeys
          .find(({ matcher }) => matcher(propertyKey))
          ?.onSet(propertyKey);
        return false;
      }
    }
  }

  hasPendingSetStates() {
    return Array.from(this.propertyKeys.values()).some(
      (info) => info instanceof ObservableProperty && info.isSetStatePending
    );
  }

  doPendingSetStates() {
    this.propertyKeys.forEach((info) => {
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
      when: "AFTER_INSTANCE",
      hook: () => {
        const propertyKeysInfo = useFixedLazyRef(() =>
          Array.from(this.propertyKeys.values()).filter(
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
