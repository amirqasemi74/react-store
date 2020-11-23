export declare const depReturnValue: unique symbol;
export declare const dep: (deps?: (() => any[]) | undefined, clearEffect?: (() => void) | undefined) => symbol;
export default dep;
