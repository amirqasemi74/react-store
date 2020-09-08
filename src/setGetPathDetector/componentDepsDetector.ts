import { MutableRefObject } from "react";
import { ComponentDeps } from "../react/hooks/useStore";
import Store from "../react/store";
import dependencyExtarctor, { GetSet, GetSetLog } from "./dependencyExtractor";

export default class ComponentDepsDetector {
  private preDepsRef: MutableRefObject<ComponentDeps> | null = null;

  private preStore: Store | null = null;

  private getSetLogs: GetSetLog[] = [];

  pushGetSetInfo(
    type: GetSet,
    target: any,
    propertyKey: PropertyKey,
    value: any
  ) {
    this.getSetLogs.push({ target, propertyKey, value, type });
  }

  extarctSetPaths(store: Store) {
    const setPaths = dependencyExtarctor(this.getSetLogs, store, "SET");
    this.resolveDeps();
    return setPaths;
  }

  saveDepsForPreAndExtractDepsForNextComponent(
    store: Store,
    depsRef: MutableRefObject<ComponentDeps>
  ) {
    if (this.preDepsRef && this.preStore) {
      this.resolveDeps();
      this.preDepsRef = depsRef;
      this.preStore = store;
    } else {
      this.preDepsRef = depsRef;
      this.preStore = store;
    }
  }

  resolveDeps() {
    if (this.preDepsRef && this.preStore) {
      this.preDepsRef.current.paths = dependencyExtarctor(
        this.getSetLogs,
        this.preStore
      );
      this.preDepsRef.current.status = "RESOLVED";
      this.preDepsRef = null;
      this.preStore = null;
      this.getSetLogs = [];
    }
  }
}
