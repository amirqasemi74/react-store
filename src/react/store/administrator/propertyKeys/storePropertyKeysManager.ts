import type { StoreAdministrator } from "../storeAdministrator";
import { ObservableProperty } from "./observableProperty";
import { useState } from "react";
import { TARGET } from "src/constant";
import { StorePropsMetadataUtils } from "src/decorators/props";
import { WireMetadataUtils } from "src/decorators/wire";
import adtProxyBuilder from "src/proxy/adtProxy/adtProxyBuilder";
import { isPrimitive } from "src/utils/isPrimitive";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StorePropertyKeysManager {
  readonly propertyKeys = new Map<PropertyKey, ObservableProperty>();

  private accessedProperties: AccessedProperty[] = [];

  private readonly policies: SetPropertyPolicy[] = [];

  constructor(private storeAdmin: StoreAdministrator) {
    // @Props
    this.policies.push({
      matcher: (propertyKey) =>
        StorePropsMetadataUtils.is(storeAdmin.type, propertyKey),
      render: false,
      set: "ORIGINAL",
    });

    //@Wire
    this.policies.push({
      matcher: (propertyKey) =>
        WireMetadataUtils.is(this.storeAdmin.type, propertyKey),
      render: false,
      set: "NONE",
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@Wire(...)\` or \`@AutoWire()\`, so can't be mutated.`
        ),
    });
  }

  makeAllObservable() {
    Object.keys(this.storeAdmin.instance).forEach((propertyKey) => {
      const policy = this.policies.find(({ matcher }) => matcher(propertyKey));
      let value = this.storeAdmin.instance[propertyKey];

      switch (policy?.set) {
        case "ORIGINAL":
        case "NONE":
          break;
        case "OBSERVABLE":
        case undefined:
          value = this.makeDeepObservable(propertyKey, value);
          break;
      }
      this.propertyKeys.set(propertyKey, new ObservableProperty(value));

      // Define setter and getter
      // to intercept this props getting and
      // return proxied value
      Object.defineProperty(this.storeAdmin.instance, propertyKey, {
        enumerable: true,
        configurable: true,
        get: () => this.onGetPropertyKey(propertyKey),
        set: (value: any) => this.onSetPropertyKey(propertyKey, value),
      });
    });
  }

  private onGetPropertyKey(propertyKey: PropertyKey) {
    const value: any = this.propertyKeys.get(propertyKey)?.getValue("Store");
    this.addAccessedProperty({
      value,
      type: "GET",
      propertyKey,
      target: this.storeAdmin.instance,
    });
    return value;
  }

  private onSetPropertyKey(propertyKey: PropertyKey, value: any) {
    this.addAccessedProperty({
      value,
      propertyKey,
      type: "SET",
      target: this.storeAdmin.instance,
    });
    // TODO write test for props
    const info = this.propertyKeys.get(propertyKey);
    const preValue = info?.getValue("Store");

    const matchedPolicy = this.policies.find(({ matcher }) => matcher(propertyKey));

    switch (matchedPolicy?.set) {
      case "ORIGINAL":
        info?.setValue(value, "Store");
        matchedPolicy?.onSet?.(propertyKey);
        break;
      case "NONE":
        matchedPolicy?.onSet?.(propertyKey);
        break;
      case "OBSERVABLE":
      case undefined:
        info?.setValue(this.makeDeepObservable(propertyKey, value), "Store");
        matchedPolicy?.onSet?.(propertyKey);
        break;
    }

    this.storeAdmin.gettersManager.recomputedGetters();

    // Props property key must not affect renders status at all.
    if (!matchedPolicy || matchedPolicy.render) {
      const info = this.propertyKeys.get(propertyKey);
      info?.reactSetState?.(info.getValue("Store"));
      if (isPrimitive(value)) {
        if (preValue !== value) {
          this.storeAdmin.renderConsumers();
        }
      } else {
        this.storeAdmin.renderConsumers();
      }
    }
  }

  private makeDeepObservable(propertyKey: PropertyKey, value: any) {
    return adtProxyBuilder({
      value,
      onAccess: this.addAccessedProperty.bind(this),
      onSet: () => {
        this.storeAdmin.gettersManager.recomputedGetters();
        const info = this.propertyKeys.get(propertyKey);
        info?.reactSetState?.(info.getValue("Store"));
        this.storeAdmin.renderConsumers();
      },
    });
  }

  /**
   * *********************** Store UseStates ******************************
   */
  registerUseStates() {
    this.storeAdmin.reactHooks.add({
      when: "AFTER_INSTANCE",
      hook: () => {
        const propertyKeysInfo = useFixedLazyRef(() =>
          Array.from(this.propertyKeys.entries()).filter(
            ([propertyKey]) =>
              !WireMetadataUtils.is(this.storeAdmin.type, propertyKey)
          )
        );
        propertyKeysInfo.forEach(([, info]) => {
          const [state, setState] = useState(() =>
            info.isPrimitive ? info.getValue("Store") : { $: info.getValue("Store") }
          );
          info.setValue(state, "State");
          info.reactSetState = setState;
        });
      },
    });
  }

  /**
   * *********************** Access Paths ******************************
   */
  clearAccessProperties() {
    this.accessedProperties = [];
  }

  addAccessedProperty(ap: AccessedProperty) {
    this.accessedProperties.push({ ...ap, value: ap.value?.[TARGET] || ap.value });
  }

  calcGetPaths() {
    const depPaths: AccessedPath[] = [];

    let path: PropertyKey[] = [];
    let preValue: any;
    for (const ap of this.accessedProperties) {
      if (ap.target === this.storeAdmin.instance) {
        path.length && depPaths.push(path);
        path = [ap.propertyKey];
      } else if (preValue === ap.target) {
        if (this.isInArrayProto(ap)) {
          path && depPaths.push(path);
          path = [];
        }
        if (
          !Object.getPrototypeOf(ap.target).hasOwnProperty(ap.propertyKey) &&
          path.length
        ) {
          path.push(ap.propertyKey);
        }
      }
      preValue = ap.value;
    }
    path.length && depPaths.push(path);
    return Array.from(depPaths);
  }

  calcSetPaths() {
    const paths: PropertyKey[][] = [];
    this.accessedProperties.forEach((ap, i) => {
      if (ap.type === "SET") {
        paths.push(this.calcSetPath(ap, i));
      }
    });
    return paths;
  }

  private calcSetPath(ap: AccessedProperty, index: number) {
    let path: PropertyKey[] = this.isInArrayProto(ap)
      ? []
      : [this.accessedProperties[index].propertyKey];

    let currentTarget = this.accessedProperties[index].target;
    for (let i = index - 1; i >= 0; i--) {
      if (currentTarget === this.accessedProperties[i].value) {
        path.unshift(this.accessedProperties[i].propertyKey);
        currentTarget = this.accessedProperties[i].target;
      }
      if (currentTarget === this.storeAdmin.instance) {
        break;
      }
    }

    return path;
  }

  private isInArrayProto(ap: AccessedProperty) {
    return (
      Array.isArray(ap.target) &&
      FullArrayAccessMethods.includes(ap.propertyKey.toString())
    );
  }
}

interface SetPropertyPolicy {
  matcher: (propertyKey: PropertyKey) => boolean;
  render: boolean;
  set: SetPropertyPolicySetType;
  onSet?: (propertyKey: PropertyKey) => void;
}

type SetPropertyPolicySetType = "ORIGINAL" | "OBSERVABLE" | "NONE";

export interface AccessedProperty {
  target: object;
  value: any;
  propertyKey: PropertyKey;
  type: "SET" | "GET";
}

export type AccessedPath = PropertyKey[];

const FullArrayAccessMethods = [
  "length",
  "copyWithin",
  "find",
  "findIndex",
  "lastIndexOf",
  "reverse",
  "slice",
  "sort",
  "splice",
  "includes",
  "indexOf",
  "join",
  "keys",
  "entries",
  "values",
  "forEach",
  "filter",
  "flat",
  "flatMap",
  "map",
  "every",
  "some",
  "reduce",
  "reduceRight",
  "toLocaleString",
  "toString",
  "findLast",
  "findLastIndex",
];
