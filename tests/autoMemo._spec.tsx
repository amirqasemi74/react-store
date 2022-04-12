// import {
//   AutoEffect,
//   AutoWire,
//   Effect,
//   Store,
//   StorePart,
//   connect,
//   useStore,
// } from "@react-store/core";
// import "@testing-library/jest-dom/extend-expect";
// import { act, render, waitFor } from "@testing-library/react";
// import React from "react";
// import { StoreAdministrator } from "src/store/administrator/storeAdministrator";

// describe.skip("Auto Memo", () => {
//   it("should compute getter if dependencies has been changed", () => {
//     const passLenFn = jest.fn();
//     const usernameFn = jest.fn();
//     let storeRef!: SampleStore;

//     @Store()
//     class SampleStore {
//       private password = "123456";

//       private user = { username: "amir" };

//       get passLen() {
//         passLenFn();
//         return this.password.length;
//       }

//       get username() {
//         usernameFn();
//         return this.user.username;
//       }

//       changeUser() {
//         this.user.username = "reza";
//       }

//       changePassword() {
//         this.password = "1234";
//       }
//     }

//     const App = connect(() => {
//       const st = useStore(SampleStore);
//       storeRef = st;
//       return (
//         <>
//           <span>{st.passLen}</span>
//           <span>{st.username}</span>
//         </>
//       );
//     }, SampleStore);

//     const { getByText } = render(<App />);

//     const storeAdmin = StoreAdministrator.get(storeRef)!;

//     expect(getByText("6")).toBeInTheDocument();
//     expect(getByText("amir")).toBeInTheDocument();
//     expect(passLenFn).toBeCalledTimes(1);
//     expect(usernameFn).toBeCalledTimes(1);

//     act(() => {
//       storeRef.changePassword();
//       storeRef.changeUser();
//     });

//     expect(getByText("4")).toBeInTheDocument();
//     expect(getByText("reza")).toBeInTheDocument();
//     expect(passLenFn).toBeCalledTimes(2);
//     expect(usernameFn).toBeCalledTimes(2);

//     expect(storeAdmin.gettersManager.getters.get("username")?.deps).toStrictEqual([
//       ["user", "username"],
//     ]);
//     expect(storeAdmin.gettersManager.getters.get("passLen")?.deps).toStrictEqual([
//       ["password"],
//     ]);
//   });

//   it("should calculate getter dependencies correctly", () => {
//     const PRIVATE_PROP = Symbol("PRIVATE_PROP");
//     let storeRef!: SampleStore;

//     @Store()
//     class SampleStore {
//       private objA: any = { b: [1, 2, { c: [{ d: [7] }] }], [PRIVATE_PROP]: 10 };

//       private arrB: any = [
//         { v: 1 },
//         { v: 2 },
//         { v: 3 },
//         { v: 4 },
//         { v: 5 },
//         { v: 6 },
//         { v: 7 },
//       ];

//       get getObjA() {
//         return this.objA.b[2].c[0].d[0];
//       }

//       get getObjAPrivate() {
//         return this.objA[PRIVATE_PROP];
//       }

//       get getArrB() {
//         return this.arrB.filter((e) => e.v > 3).length;
//       }
//     }

//     const App = connect(() => {
//       const st = useStore(SampleStore);
//       storeRef = st;
//       return (
//         <>
//           <span>{st.getObjA}</span>
//           <span>{st.getArrB}</span>
//           <span>{st.getObjAPrivate}</span>
//         </>
//       );
//     }, SampleStore);

//     const { getByText } = render(<App />);

//     const storeAdmin = StoreAdministrator.get(storeRef)!;

//     expect(getByText("7")).toBeInTheDocument();

//     expect(storeAdmin.gettersManager.getters.get("getObjA")?.deps).toHaveLength(1);
//     expect(storeAdmin.gettersManager.getters.get("getObjA")?.deps[0].join(".")).toBe(
//       "objA.b.2.c.0.d.0"
//     );

//     expect(
//       storeAdmin.gettersManager.getters.get("getObjAPrivate")?.deps
//     ).toHaveLength(1);
//     expect(
//       storeAdmin.gettersManager.getters.get("getObjAPrivate")?.deps[0]
//     ).toStrictEqual(["objA", PRIVATE_PROP]);

//     expect(storeAdmin.gettersManager.getters.get("getArrB")?.deps).toHaveLength(1);
//     expect(storeAdmin.gettersManager.getters.get("getArrB")?.deps[0].join(".")).toBe(
//       "arrB"
//     );
//   });

//   it("should remove duplicate deps from dependencies array", () => {
//     let store!: ComputedStore;
//     @Store()
//     class ComputedStore {
//       obj = { a: 1 };

//       arr = [1, 2, 3, 4, 1, 4, 5, 1];

//       get getOneCount() {
//         return this.arr.reduce((acc, val) => {
//           if (val === this.obj.a) return acc++;
//           return acc;
//         }, 0);
//       }
//     }

//     const App = connect(() => {
//       store = useStore(ComputedStore);
//       return (
//         <>
//           <span>{store.getOneCount}</span>
//         </>
//       );
//     }, ComputedStore);

//     render(<App />);

//     expect(
//       StoreAdministrator.get(store)!.gettersManager.getters.get("getOneCount")?.deps
//     ).toStrictEqual([["arr"], ["obj", "a"]]);
//   });

//   it("should calculate dependencies for injected store accessed properties", async () => {
//     let lowerStore!: LowerStore;

//     @Store()
//     class UpperStore {
//       a = [1, 2, 3];

//       @Effect([])
//       async setA() {
//         await new Promise((res) => setTimeout(res, 0));
//         this.a = [1, 2, 3, 4, 5, 6, 7];
//       }
//     }

//     @Store()
//     class LowerStore {
//       constructor(public upperStore: UpperStore) {}

//       get aLen() {
//         return this.upperStore.a.length;
//       }
//     }

//     const App = connect(
//       connect(() => {
//         lowerStore = useStore(LowerStore);
//         return <span>{lowerStore.aLen}</span>;
//       }, LowerStore),
//       UpperStore
//     );

//     const { getByText, findByText } = render(<App />);

//     const storeAdmin = StoreAdministrator.get(lowerStore);

//     expect(storeAdmin?.gettersManager.getters.get("aLen")?.deps).toStrictEqual([
//       ["upperStore", "a"],
//     ]);
//     expect(lowerStore.aLen).toBe(3);
//     expect(getByText("3")).toBeInTheDocument();

//     await waitFor(async () => expect(await findByText("7")).toBeInTheDocument());
//     expect(storeAdmin?.gettersManager.getters.get("aLen")?.deps).toStrictEqual([
//       ["upperStore", "a"],
//     ]);
//     expect(lowerStore.aLen).toBe(7);
//   });

//   it("should calculate dependencies for wired storePart accessed properties", () => {
//     let store!: ComputedStore;

//     @StorePart()
//     class PartStore {
//       obj = { a: { b: [1, 2, 3, 4] } };
//     }

//     @Store()
//     class ComputedStore {
//       @AutoWire()
//       part: PartStore;

//       constructor() {
//         store = this;
//       }
//       get test() {
//         return this.part.obj.a.b.some((e) => e > 2);
//       }
//     }

//     const App = connect(() => {
//       const st = useStore(ComputedStore);
//       return <>{st.test}</>;
//     }, ComputedStore);

//     render(<App />);

//     const storeAdmin = StoreAdministrator.get(store);

//     expect(storeAdmin?.gettersManager.getters.get("test")?.deps).toStrictEqual([
//       ["part", "obj", "a", "b"],
//     ]);
//     expect(store.test).toBeTruthy();

//     act(() => {
//       store.part.obj.a.b = [1, 2];
//     });

//     expect(storeAdmin?.gettersManager.getters.get("test")?.deps).toStrictEqual([
//       ["part", "obj", "a", "b"],
//     ]);
//     expect(store.test).toBeFalsy();
//   });

//   it("should recompute computed in lower store from computed in upper store", async () => {
//     let lowerStore!: LowerStore;

//     @Store()
//     class UpperStore {
//       a = [1, 2, 3];

//       @Effect([])
//       async setA() {
//         await new Promise((res) => setTimeout(res));
//         this.a = [1, 2, 3, 4];
//       }

//       get aLen() {
//         return this.a.length;
//       }
//     }

//     @Store()
//     class LowerStore {
//       constructor(public upperStore: UpperStore) {}

//       get aLenPlus2() {
//         return this.upperStore.a.length + 2;
//       }
//     }

//     const LowerStoreComp = connect(() => {
//       lowerStore = useStore(LowerStore);
//       return <span>{lowerStore.aLenPlus2}</span>;
//     }, LowerStore);

//     const App = connect(() => {
//       return <LowerStoreComp />;
//     }, UpperStore);

//     const { getByText, findByText } = render(<App />);

//     const storeAdmin = StoreAdministrator.get(lowerStore);

//     expect(storeAdmin?.gettersManager.getters.get("aLenPlus2")?.deps).toStrictEqual([
//       ["upperStore", "a"],
//     ]);
//     expect(lowerStore.aLenPlus2).toBe(5);
//     expect(getByText("5")).toBeInTheDocument();

//     await waitFor(async () => expect(await findByText("6")).toBeInTheDocument());
//     expect(storeAdmin?.gettersManager.getters.get("aLenPlus2")?.deps).toStrictEqual([
//       ["upperStore", "a"],
//     ]);
//     expect(lowerStore.aLenPlus2).toBe(6);
//   });

//   it("should detect autoEffect dependencies when effect trigger recompute getter in upper store", async () => {
//     let store!: ComputedStore;

//     @Store()
//     class UpperComputedStore {
//       obj = { a: 1 };

//       changeObj() {
//         this.obj.a = 2;
//       }

//       get objStr() {
//         return JSON.stringify(this.obj);
//       }
//     }

//     @Store()
//     class ComputedStore {
//       constructor(public upper: UpperComputedStore) {}

//       @AutoEffect()
//       changeUpperObj() {
//         this.upper.changeObj();
//       }
//     }

//     const App = connect(
//       connect(() => {
//         store = useStore(ComputedStore);
//         return <span>{store.upper.objStr}</span>;
//       }, ComputedStore),
//       UpperComputedStore
//     );

//     const { getByText } = render(<App />);

//     const storeAdmin = StoreAdministrator.get(store);

//     expect(
//       storeAdmin?.effectsManager.effects.get("changeUpperObj")?.deps
//     ).toStrictEqual([]);

//     expect(getByText('{"a":2}')).toBeInTheDocument();
//   });

//   it("should recomputed getter for typeof object dependencies value", async () => {
//     let store!: ComputedStore;

//     @Store()
//     class ComputedStore {
//       obj = { a: 1 };

//       constructor() {
//         store = this;
//       }
//       get objFromGetter() {
//         return this.obj;
//       }
//     }

//     const App = connect(() => {
//       const st = useStore(ComputedStore);
//       return <span>{JSON.stringify(st.objFromGetter)}</span>;
//     }, ComputedStore);

//     const { getByText } = render(<App />);

//     const storeAdmin = StoreAdministrator.get(store);

//     expect(
//       storeAdmin?.gettersManager.getters.get("objFromGetter")?.deps
//     ).toStrictEqual([["obj"]]);
//     expect(getByText('{"a":1}')).toBeInTheDocument();

//     act(() => {
//       store.obj = { a: 2 };
//     });
//     expect(getByText('{"a":2}')).toBeInTheDocument();
//   });

//   it("should recomputed getter if upper store property set to lower store property", () => {
//     let lowerStore!: LowerStore;
//     let upperStore!: UpperStore;
//     @Store()
//     class UpperStore {
//       arr: any = [1, { arr: [1] }];

//       constructor() {
//         upperStore = this;
//       }
//     }

//     @Store()
//     class LowerStore {
//       fromUpperStoreArr?: any;

//       constructor(public upperStore: UpperStore) {
//         lowerStore = this;
//       }

//       get arrLen() {
//         return this.fromUpperStoreArr?.[1]?.arr.length || 0;
//       }

//       @Effect([])
//       onUpperArrChanged() {
//         this.fromUpperStoreArr = this.upperStore.arr;
//       }
//     }

//     const App = connect(
//       connect(() => {
//         const st = useStore(LowerStore);
//         return <p>{st.arrLen}</p>;
//       }, LowerStore),
//       UpperStore
//     );

//     const { getByText } = render(<App />);

//     expect(getByText("1")).toBeInTheDocument();

//     act(() => {
//       upperStore.arr[1].arr = [1, 2];
//     });
//     expect(getByText("1")).toBeInTheDocument();

//     act(() => {
//       // here we create inner proxy in {...upperStore.arr[1] }
//       lowerStore.fromUpperStoreArr[1] = { ...upperStore.arr[1] };
//     });
//     expect(getByText("2")).toBeInTheDocument();
//   });
// });
