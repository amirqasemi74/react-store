import React from "react";
import { ClassType } from "../../types";
declare const connectStore: <T extends object>(Component: React.FC<T>, storeType: ClassType) => React.FC<T>;
export default connectStore;
