import { BaseAdtProxyBuilderArgs } from "./adtProxy";
export default function proxyValueAndSaveIt(target: any, propertyKey: PropertyKey, receiver: any, adtProxyBuilderArgs: BaseAdtProxyBuilderArgs): {
    value: any;
    pureValue: any;
};
export declare const PROXYED_VALUE: unique symbol;
