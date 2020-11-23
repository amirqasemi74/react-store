import 'reflect-metadata';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { dequal } from 'dequal';
import objectPath from 'object-path';
import isPromise from 'is-promise';

function inject (...deps) {
    return function (...decoArgs) {
        const isClassDecorator = decoArgs.length === 1;
        const isParameterDecorator = decoArgs.length === 3 &&
            decoArgs[1] === undefined &&
            typeof decoArgs[2] === "number";
        if (isClassDecorator) {
            const target = decoArgs[0];
            Reflect.defineMetadata(IS_INJECTED_USING_CLASS_DECORATOR, true, target);
            if (Reflect.getMetadata(IS_INJECTED_USING_PARAMETER_DECORATOR, target)) {
                throw new Error(`${target.name}: Dependencies are injecting by @Inject as parameter decorator. Simultaneous, using @Inject as class 
          decorator is not allow. remove one of them.
        `);
            }
            Reflect.defineMetadata(CONSTRUCTOR_DEPENDENCY_TYPES, deps
                .map((type, parameterIndex) => ({
                type,
                parameterIndex,
            }))
                .sort((a, b) => a.parameterIndex - b.parameterIndex), target);
        }
        if (isParameterDecorator) {
            const target = decoArgs[0];
            Reflect.defineMetadata(IS_INJECTED_USING_PARAMETER_DECORATOR, true, target);
            if (Reflect.getMetadata(IS_INJECTED_USING_CLASS_DECORATOR, target)) {
                throw new Error(`${target.name}: Dependencies are injecting by @Inject as class decorator. Simultaneous, using @Inject as parameter 
          decorator is not allow. remove one of them.
        `);
            }
            const constructorDepTypes = Reflect.getMetadata(CONSTRUCTOR_DEPENDENCY_TYPES, target) || [];
            Reflect.defineMetadata(CONSTRUCTOR_DEPENDENCY_TYPES, constructorDepTypes
                .concat({ type: deps[0], parameterIndex: decoArgs[2] })
                .sort((a, b) => a.parameterIndex - b.parameterIndex), target);
        }
    };
}
const CONSTRUCTOR_DEPENDENCY_TYPES = Symbol();
const IS_INJECTED_USING_CLASS_DECORATOR = Symbol();
const IS_INJECTED_USING_PARAMETER_DECORATOR = Symbol();
const getConstructorDependencyTypes = (consructorType) => Reflect.getMetadata(CONSTRUCTOR_DEPENDENCY_TYPES, consructorType) || [];

class Container {
    constructor() {
        this.instances = new Map();
    }
    resolve(SomeClass) {
        let instance = this.instances.get(SomeClass);
        if (!instance) {
            instance = new SomeClass(...this.resolveDependencies(SomeClass));
            this.instances.set(SomeClass, instance);
        }
        return instance;
    }
    resolveDependencies(someClass) {
        return getConstructorDependencyTypes(someClass).map((dep) => this.resolve(dep.type));
    }
    hasCircularDependency(SomeClass) {
        const detectCircularDependency = (SomeClass, depsPath) => {
            const deps = getConstructorDependencyTypes(SomeClass);
            console.log(SomeClass.name, deps);
            for (const { type } of deps) {
                if (type === SomeClass) {
                    throw new Error(`Circular Dependency Detected: ${[...depsPath, type]
                        .map((d) => d.name)
                        .join(" -> ")}`);
                }
                detectCircularDependency(type, [
                    ...depsPath,
                    type,
                ]);
            }
        };
        detectCircularDependency(SomeClass, [SomeClass]);
    }
    remove(someClass) {
        this.instances.delete(someClass);
    }
    clearContainer() {
        this.instances.clear();
    }
}
const defaultContainer = new Container();
const getFromContainer = (someClass, container = defaultContainer) => container.resolve(someClass);

function Injectable(options) {
    return function (target) { };
}

function uid() {
    const validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let array = new Uint8Array(10);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map(x => validChars.charAt(x % validChars.length))
        .join("");
}

const STORE_USED_CONTEXTES = Symbol("STORE_USED_CONTEXTES");
const STORE_ADMINISTRATION = Symbol("STORE_ADMINISTRATION");

const getType = (obj) => {
    const proto = Reflect.getPrototypeOf(obj);
    return proto && proto.constructor;
};
const isStore = (target) => !!target[STORE_ADMINISTRATION];
const getStoreAdministration = (target) => target[STORE_ADMINISTRATION] || null;

const SERVICE_OPTIONS = Symbol("SERVICE_OPTIONS");
function Service() {
    return function (target) {
        Reflect.defineMetadata(SERVICE_OPTIONS, {}, target);
    };
}
const isService = (target) => {
    return !!Reflect.getMetadata(SERVICE_OPTIONS, target);
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function proxyValueAndSaveIt(target, propertyKey, receiver, adtProxyBuilderArgs) {
    const value = Reflect.get(target, propertyKey, receiver);
    if (propertyKey === PROXYED_VALUE) {
        return {
            pureValue: value,
            value,
        };
    }
    if (value &&
        !value[STORE_ADMINISTRATION] &&
        !Object.isFrozen(value) &&
        !isInArrayOrObjectPrototype(target, propertyKey) &&
        (value.constructor === Object ||
            value.constructor === Array ||
            value instanceof Function ||
            (value instanceof Object && isService(value.constructor)))) {
        const proxiedValue = () => adtProxyBuilder(Object.assign({ value, context: receiver }, adtProxyBuilderArgs));
        return {
            pureValue: value,
            value: adtProxyBuilderArgs.cacheProxied
                ? value[PROXYED_VALUE] || (value[PROXYED_VALUE] = proxiedValue())
                : proxiedValue(),
        };
    }
    return { pureValue: value, value };
}
const PROXYED_VALUE = Symbol("PROXYED_VALUE");
const isInArrayOrObjectPrototype = (target, propertyKey) => (target.constructor === Object && Object.prototype[propertyKey]) ||
    (target.constructor === Array && Array.prototype[propertyKey]);

const arrayProxyBuilder = (_a) => {
    var { array } = _a, restOfArgs = __rest(_a, ["array"]);
    const { getSetLogs, onSet } = restOfArgs;
    return new Proxy(array, {
        get(target, propertyKey, receiver) {
            const { pureValue, value } = proxyValueAndSaveIt(target, propertyKey, receiver, restOfArgs);
            getSetLogs === null || getSetLogs === void 0 ? void 0 : getSetLogs.push({
                type: "GET",
                target,
                propertyKey,
                value: pureValue,
            });
            return value;
        },
        set(target, propertyKey, value, receiver) {
            getSetLogs === null || getSetLogs === void 0 ? void 0 : getSetLogs.push({ type: "SET", target, propertyKey, value });
            const res = Reflect.set(target, propertyKey, value, receiver);
            onSet === null || onSet === void 0 ? void 0 : onSet();
            return res;
        },
    });
};

const functionProxyBuilder = ({ func, context, }) => {
    return new Proxy(func, {
        apply(target, thisArg, argArray) {
            return Reflect.apply(target, context, argArray);
        },
    });
};

const objectProxyBuilder = (_a) => {
    var { object } = _a, restOfArgs = __rest(_a, ["object"]);
    const { getSetLogs, onSet } = restOfArgs;
    return new Proxy(object, {
        get(target, propertyKey, receiver) {
            const { pureValue, value } = proxyValueAndSaveIt(target, propertyKey, receiver, restOfArgs);
            getSetLogs === null || getSetLogs === void 0 ? void 0 : getSetLogs.push({
                type: "GET",
                target,
                propertyKey,
                value: pureValue,
            });
            return value;
        },
        set(target, propertyKey, value, receiver) {
            getSetLogs === null || getSetLogs === void 0 ? void 0 : getSetLogs.push({
                type: "SET",
                target,
                propertyKey,
                value,
            });
            const res = Reflect.set(target, propertyKey, value, receiver);
            onSet === null || onSet === void 0 ? void 0 : onSet();
            return res;
        },
    });
};

const adtProxyBuilder = (_a) => {
    var _b, _c, _d, _e;
    var { value, context } = _a, restOfArgs = __rest(_a, ["value", "context"]);
    restOfArgs = Object.assign(Object.assign({}, restOfArgs), { cacheProxied: (_b = restOfArgs.cacheProxied) !== null && _b !== void 0 ? _b : true });
    const { proxyTypes } = restOfArgs;
    const doObjectProxy = (_c = proxyTypes === null || proxyTypes === void 0 ? void 0 : proxyTypes.includes("Object")) !== null && _c !== void 0 ? _c : true;
    const doArrayProxy = (_d = proxyTypes === null || proxyTypes === void 0 ? void 0 : proxyTypes.includes("Array")) !== null && _d !== void 0 ? _d : true;
    const doFucntionProxy = (_e = proxyTypes === null || proxyTypes === void 0 ? void 0 : proxyTypes.includes("Function")) !== null && _e !== void 0 ? _e : true;
    try {
        if ((value.constructor === Object &&
            !Object.isFrozen(value) &&
            doObjectProxy) ||
            (value instanceof Object &&
                (isStore(value) || isService(value.constructor)))) {
            return objectProxyBuilder(Object.assign({ object: value }, restOfArgs));
        }
        if (value.constructor === Array && doArrayProxy) {
            return arrayProxyBuilder(Object.assign({ array: value }, restOfArgs));
        }
        if (value instanceof Function && doFucntionProxy) {
            return functionProxyBuilder({
                func: value,
                context,
            });
        }
    }
    catch (error) { }
    return value;
};

class EffectsContainer {
    constructor() {
        this.effects = new Map();
    }
    storeEffet(effectKey, effect) {
        this.effects.set(effectKey, effect);
    }
    getEffect(effectKey) {
        return this.effects.get(effectKey);
    }
}

class ServiceInfo extends EffectsContainer {
    constructor({ context, pureContext }) {
        super();
        this.context = context;
        this.pureContext = pureContext;
    }
}

class StoreAdministration extends EffectsContainer {
    constructor() {
        super(...arguments);
        this.instancePropsValue = new Map();
        this.consumers = [];
        this.servicesInfo = new Map();
        this.injectedIntos = new Map();
        this.isRenderAllow = true;
    }
    init({ id, instance }) {
        this.id = id;
        this.constructorType = getType(instance);
        this.pureInstance = instance;
        instance[STORE_ADMINISTRATION] = this;
        this.instance = adtProxyBuilder({
            value: instance,
            onSet: this.renderConsumers.bind(this),
        });
        this.turnOffRender();
        this.instance[STORE_ADMINISTRATION] = this.pureInstance[STORE_ADMINISTRATION] = this;
        this.initServiceEffectContainers();
        this.turnOnRender();
    }
    initServiceEffectContainers() {
        Object.entries(this.pureInstance).map(([propertyKey, value]) => {
            if (value &&
                isService(value.constructor) &&
                !this.servicesInfo.has(propertyKey)) {
                this.servicesInfo.set(propertyKey, new ServiceInfo({
                    pureContext: value,
                    context: this.instance[propertyKey],
                }));
            }
        });
    }
    turnOffRender() {
        this.isRenderAllow = false;
    }
    turnOnRender() {
        this.isRenderAllow = true;
    }
    renderConsumers() {
        if (this.isRenderAllow) {
            this.consumers.forEach((cnsr) => cnsr.render());
            this.injectedIntos.forEach(({ storeAdministration }) => storeAdministration.renderConsumers());
        }
    }
    addInjectedInto({ propertyKey, storeAdministration }) {
        if (!this.injectedIntos.has(storeAdministration.id)) {
            this.injectedIntos.set(storeAdministration.id, {
                storeAdministration,
                propertyKey,
            });
        }
    }
}

class ReactAppContext {
    constructor() {
        this.storeAdministrations = [];
        this.storeAdministrationContexts = new Map();
    }
    resolveStore({ StoreType, id, storeDeps, }) {
        let storeAdministration = this.storeAdministrations.find((s) => s.id === id && s.constructorType === StoreType);
        const allStoreDepTypes = getConstructorDependencyTypes(StoreType);
        const depsValue = allStoreDepTypes.map((dep) => { var _a, _b; return (_b = (_a = storeDeps === null || storeDeps === void 0 ? void 0 : storeDeps.get(dep.type)) === null || _a === void 0 ? void 0 : _a.instance) !== null && _b !== void 0 ? _b : getFromContainer(dep.type); });
        if (!storeAdministration) {
            const store = new StoreType(...depsValue);
            storeAdministration =
                getStoreAdministration(store) || new StoreAdministration();
            storeAdministration.init({
                id: id || uid(),
                instance: store,
            });
            this.storeAdministrations.push(storeAdministration);
        }
        return storeAdministration;
    }
    registerStoreContext(storeType, context) {
        this.storeAdministrationContexts.set(storeType, context);
    }
    findStoreContext(storeType) {
        return this.storeAdministrationContexts.get(storeType);
    }
}

const useStore = (storeType) => {
    let storeAdministration = null;
    const [, setRenderKey] = useState(uid());
    const appContext = getFromContainer(ReactAppContext);
    const storeAdministrationContext = appContext.findStoreContext(storeType);
    if (storeAdministrationContext) {
        storeAdministration = useContext(storeAdministrationContext);
        if (!storeAdministration) {
            throw new Error(`${storeType.name} haven't been connected to the component tree!`);
        }
        useEffect(() => {
            const render = () => setRenderKey(uid());
            storeAdministration === null || storeAdministration === void 0 ? void 0 : storeAdministration.consumers.push({ render });
            return () => {
                if (storeAdministration) {
                    storeAdministration.consumers = storeAdministration.consumers.filter((cnsr) => cnsr.render !== render);
                }
            };
        }, []);
    }
    if (!(storeAdministration === null || storeAdministration === void 0 ? void 0 : storeAdministration.instance)) {
        throw new Error(`${storeType.name} doesn't decorated with @ContextStore/@GlobalStore`);
    }
    return storeAdministration.instance;
};

function ContextStore() {
    return function (StoreType) {
        class ImprovedStoreType extends StoreType {
            constructor(...args) {
                super(...args);
                Object.keys(this).map((propertyKey) => {
                    const storeAdmin = getStoreAdministration(this) ||
                        (this[STORE_ADMINISTRATION] = new StoreAdministration());
                    storeAdmin.instancePropsValue.set(propertyKey, this[propertyKey]);
                    Object.defineProperty(this, propertyKey, {
                        enumerable: true,
                        configurable: true,
                        get() {
                            const storeAdmin = getStoreAdministration(this);
                            const value = storeAdmin === null || storeAdmin === void 0 ? void 0 : storeAdmin.instancePropsValue.get(propertyKey);
                            return (value === null || value === void 0 ? void 0 : value[PROXYED_VALUE]) || value;
                        },
                        set(value) {
                            var _a;
                            (_a = getStoreAdministration(this)) === null || _a === void 0 ? void 0 : _a.instancePropsValue.set(propertyKey, value);
                        },
                    });
                });
            }
        }
        Reflect.defineProperty(ImprovedStoreType, "name", {
            writable: false,
            value: StoreType.name,
        });
        const context = React.createContext(null);
        context.displayName = `${StoreType.name}`;
        getFromContainer(ReactAppContext).registerStoreContext(ImprovedStoreType, context);
        return ImprovedStoreType;
    };
}

const PROPS_PROPERTY_KEY = Symbol();
const Props = (target, propertyKey) => {
    Reflect.defineMetadata(PROPS_PROPERTY_KEY, propertyKey, target.constructor);
};
const getStorePropsPropertyKey = (target) => Reflect.getMetadata(PROPS_PROPERTY_KEY, target);

function UseContext(context) {
    return (target, propertyKey) => {
        const ctxes = Reflect.get(target.constructor, STORE_USED_CONTEXTES) || [];
        ctxes.push({
            propertyKey,
            type: context
        });
        Reflect.set(target.constructor, STORE_USED_CONTEXTES, ctxes);
    };
}

const usedContextesHandler = (storeAdministration) => {
    const storeUsedContextes = storeAdministration.constructorType[STORE_USED_CONTEXTES] || [];
    storeAdministration.turnOffRender();
    storeUsedContextes
        .map((storeUsedCtx) => (Object.assign(Object.assign({}, storeUsedCtx), { value: useContext(storeUsedCtx.type) })))
        .forEach((storeUsedCtx) => {
        Reflect.set(storeAdministration.instance, storeUsedCtx.propertyKey, storeUsedCtx.value);
    });
    storeAdministration.turnOnRender();
};

const EFFECTS = Symbol("EFFECTS");
function Effect(options = {}) {
    return function (target, propertyKey, descriptor) {
        const effects = Reflect.getMetadata(EFFECTS, target.constructor) || [];
        effects.push({ options, propertyKey });
        Reflect.defineMetadata(EFFECTS, effects, target.constructor);
        return descriptor;
    };
}
const getEffectsMetaData = (target) => Reflect.getMetadata(EFFECTS, target) || [];

const dependencyExtarctor = (getSetLogs, pureContext, type = "GET") => {
    var _a;
    getSetLogs = [...getSetLogs];
    if (!getSetLogs.length) {
        return [];
    }
    const getSetItems = [];
    let i = -1;
    for (const index in getSetLogs) {
        const { propertyKey, target, value, type } = getSetLogs[index];
        switch (type) {
            case "GET": {
                if (propertyKey in pureContext) {
                    i++;
                    getSetItems.push({
                        path: `GET::${propertyKey.toString()}`,
                        value,
                    });
                }
                else {
                    if (getSetItems[i].value === target ||
                        (isStore(target) &&
                            isStore(getSetItems[i].value) &&
                            target[STORE_ADMINISTRATION] ===
                                getSetItems[i].value[STORE_ADMINISTRATION])) {
                        getSetItems[i] = {
                            path: `${getSetItems[i].path}.${propertyKey.toString()}`,
                            value,
                        };
                    }
                    else {
                        i++;
                        getSetItems.push({
                            path: `GET::${(_a = findChain({
                                getSetLogs,
                                target,
                                upToIndex: Number(index),
                            })) === null || _a === void 0 ? void 0 : _a.toString()}.${propertyKey.toString()}`,
                            value,
                        });
                    }
                }
                break;
            }
            case "SET": {
                const j = getSetItems.findIndex((t) => t.value === target);
                const z = getSetLogs.findIndex((t) => t.value === target);
                if (j !== -1) {
                    getSetItems[j] = {
                        path: `${getSetItems[j].path}.${propertyKey.toString()}`.replace("GET", "SET"),
                        value,
                    };
                }
                else if (z !== -1) {
                    getSetItems[++i] = {
                        path: `SET::${getSetLogs[z].propertyKey.toString()}.${propertyKey.toString()}`,
                        value,
                    };
                }
                else if (propertyKey in pureContext) {
                    i++;
                    getSetItems.push({
                        path: `SET::${propertyKey.toString()}`,
                        value,
                    });
                }
                break;
            }
        }
    }
    return Array.from(new Set(getSetItems
        .filter(({ path }) => path.startsWith(`${type}::`))
        .map(({ path }) => path.replace(`${type}::`, ""))));
};
const findChain = ({ upToIndex, getSetLogs, target: initTarget, }) => {
    let chain = "";
    let target = initTarget;
    for (let i = upToIndex; i >= 0; i--) {
        if (target === getSetLogs[i].value) {
            chain = chain
                ? `${getSetLogs[i].propertyKey.toString()}.${chain}`
                : `${getSetLogs[i].propertyKey.toString()}`;
            target = getSetLogs[i].target;
        }
    }
    return chain;
};

const depReturnValue = Symbol("DEP_RETURN_VALUE");
const dep = (deps, clearEffect) => {
    const appContext = getFromContainer(ReactAppContext);
    appContext.currentRunningEffect = {
        depsList: deps,
        clearEffect,
    };
    return depReturnValue;
};

const runEffect = ({ container, effectKey, context: _context, pureContext, depsValues, }) => {
    var _a, _b;
    const appContext = getFromContainer(ReactAppContext);
    const getSetLogs = [];
    const context = adtProxyBuilder({
        getSetLogs,
        value: _context,
        cacheProxied: false,
    });
    const res = Reflect.apply(pureContext[effectKey], context, []);
    if (isPromise(res)) {
        throw new Error("Async function for effect is invalid!");
    }
    if (res === depReturnValue) {
        getSetLogs.length = 0;
        (_b = (_a = appContext.currentRunningEffect).depsList) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    const deps = dependencyExtarctor(getSetLogs, pureContext);
    container.storeEffet(effectKey, {
        deps,
        depsValues: depsValues ||
            deps.map((path) => objectPath.withInheritedProps.get(pureContext, path)),
        isCalledOnce: true,
        clearEffect: res === depReturnValue
            ? appContext.currentRunningEffect.clearEffect
            : res instanceof Function
                ? res
                : null,
    });
};

const cofingEffectRunner = ({ metaData, container, pureContext, context, }) => {
    metaData.forEach(({ propertyKey: effectKey, options }) => {
        const getDepsValues = (effectKey) => {
            const effect = container.getEffect(effectKey);
            return effect.deps.map((path) => objectPath.withInheritedProps.get(pureContext, path));
        };
        useEffect(() => {
            var _a;
            const effect = container.getEffect(effectKey);
            if (effect === null || effect === void 0 ? void 0 : effect.isCalledOnce) {
                const depsValues = getDepsValues(effectKey);
                const isEqual = options.dequal ? dequal : Object.is;
                let isDepsEqual = true;
                for (let i = 0; i < depsValues.length; i++) {
                    if (!isEqual(depsValues[i], effect.depsValues[i])) {
                        isDepsEqual = false;
                        break;
                    }
                }
                if (!isDepsEqual) {
                    (_a = effect.clearEffect) === null || _a === void 0 ? void 0 : _a.call(effect);
                    runEffect({
                        container,
                        effectKey,
                        pureContext,
                        depsValues,
                        context,
                    });
                }
            }
            else {
                runEffect({ container, effectKey, pureContext, context });
            }
        });
    });
};

const effectHandler = (storeAdministration) => {
    cofingEffectRunner({
        container: storeAdministration,
        context: storeAdministration.instance,
        pureContext: storeAdministration.pureInstance,
        metaData: getEffectsMetaData(storeAdministration.constructorType),
    });
    Array.from(storeAdministration.servicesInfo.values()).map((serviceInfo) => {
        const { context, pureContext } = serviceInfo;
        cofingEffectRunner({
            container: serviceInfo,
            context,
            pureContext,
            metaData: getEffectsMetaData(pureContext.constructor),
        });
    });
};

function propsHandler(storeAdministration, props) {
    const propsPropertyKey = getStorePropsPropertyKey(storeAdministration.constructorType);
    useEffect(() => {
        if (propsPropertyKey) {
            storeAdministration.turnOffRender();
            Reflect.set(storeAdministration.instance, propsPropertyKey, props);
            storeAdministration.turnOnRender();
        }
    }, [props]);
}

const handlers = [usedContextesHandler, propsHandler, effectHandler];
const registerHandlers = (storeAdministration, props) => handlers.forEach((handler) => handler(storeAdministration, props));

const storeInjectionHandler = (storeType) => {
    const storeDeps = getConstructorDependencyTypes(storeType);
    const storeDepsValue = new Map();
    const appContext = getFromContainer(ReactAppContext);
    storeDeps.forEach((dep) => {
        if (dep.type === storeType) {
            throw new Error(`You can't inject ${storeType.name} into ${storeType.name}!`);
        }
        const storeContext = appContext.findStoreContext(dep.type);
        if (!storeContext) {
            return;
        }
        const store = useContext(storeContext);
        if (!store) {
            throw new Error(`${dep.type.name} haven't been connected to the component tree!`);
        }
        storeDepsValue.set(dep.type, store);
    });
    return storeDepsValue;
};

const useLazyRef = (initialValFunc) => {
    const ref = useRef(null);
    if (ref.current === null) {
        ref.current = initialValFunc();
    }
    return ref;
};

const buildProviderComponent = (TheContext, StoreType) => ({ children, props }) => {
    const [, setRenderKey] = useState(() => uid());
    const id = useLazyRef(() => uid()).current;
    const appContext = getFromContainer(ReactAppContext);
    const injectedStores = storeInjectionHandler(StoreType);
    const storeAdministration = useLazyRef(() => appContext.resolveStore({
        StoreType,
        id,
        type: "context",
        storeDeps: injectedStores,
    })).current;
    if (injectedStores.size) {
        storeAdministration.turnOffRender();
        injectedStores.forEach((injectedStore) => {
            var _a;
            injectedStore.turnOffRender();
            for (const [propertyKey, value] of Object.entries(storeAdministration.pureInstance)) {
                if (((_a = value === null || value === void 0 ? void 0 : value[STORE_ADMINISTRATION]) === null || _a === void 0 ? void 0 : _a.id) ===
                    injectedStore.id) {
                    injectedStore.addInjectedInto({ storeAdministration, propertyKey });
                }
            }
            injectedStore.turnOnRender();
        });
        storeAdministration.turnOnRender();
    }
    useEffect(() => {
        const render = () => setRenderKey(uid());
        storeAdministration.consumers.push({ render });
        return () => {
            storeAdministration.consumers = storeAdministration.consumers.filter((cnsr) => cnsr.render !== render);
        };
    }, []);
    registerHandlers(storeAdministration, props);
    return (React.createElement(TheContext.Provider, { value: storeAdministration }, children));
};

const connectStore = (Component, storeType) => {
    const storeContext = getFromContainer(ReactAppContext).findStoreContext(storeType);
    if (!storeContext) {
        throw new Error(`${storeType.name} doesn't decorated with @ContextStore/@GlobalStore`);
    }
    const ContextProvider = buildProviderComponent(storeContext, storeType);
    return (props) => (React.createElement(ContextProvider, { props: props },
        React.createElement(Component, Object.assign({}, props))));
};

export { ContextStore, Effect, inject as Inject, Injectable, Props, Service, UseContext, connectStore, dep, getFromContainer, useStore };
