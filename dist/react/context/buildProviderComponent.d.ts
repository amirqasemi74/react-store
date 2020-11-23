import React, { Context } from "react";
import { ClassType } from "../../types";
import StoreAdministration from "../storeAdministration";
interface ProviderComponentProps {
    props?: any;
}
declare const buildProviderComponent: (TheContext: Context<StoreAdministration | null>, StoreType: ClassType) => React.FC<ProviderComponentProps>;
export default buildProviderComponent;
