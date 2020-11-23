import React from "react";
import { ClassType } from "../types";
import StoreAdministration from "./storeAdministration";
interface ResolveStoreArgs {
    StoreType: ClassType;
    id?: string;
    type?: "context";
    storeDeps?: Map<Function, StoreAdministration>;
}
interface CurrentRunnigEffect {
    depsList?: () => any[];
    clearEffect?: () => void;
}
export default class ReactAppContext {
    private storeAdministrations;
    private storeAdministrationContexts;
    currentRunningEffect: CurrentRunnigEffect;
    resolveStore({ StoreType, id, storeDeps, }: ResolveStoreArgs): StoreAdministration;
    registerStoreContext(storeType: Function, context: React.Context<StoreAdministration | null>): void;
    findStoreContext(storeType: Function): React.Context<StoreAdministration | null> | undefined;
}
export {};
