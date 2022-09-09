import { Inject, Injectable, ReactStore, Scope } from "..";
import { Injector } from "./Injector";

describe("IOC Container", () => {
  beforeEach(() => {
    ReactStore.container.clear();
    jest.restoreAllMocks();
  });

  it("should resolve dependencies automatically", () => {
    @Injectable()
    class UserInfo1 {
      username = "user1";
      password = "1";
    }

    @Injectable()
    class UserInfo2 {
      username = "user2";
      password = "2";
    }

    @Injectable()
    class App1 {
      constructor(public user1: UserInfo1, public user2: UserInfo2) {}
    }

    @Injectable()
    class App2 {
      constructor(public user1: UserInfo1, public user2: UserInfo2) {}
    }
    expect(ReactStore.container.resolve(App1).user1).toBeDefined();
    expect(ReactStore.container.resolve(App1).user2).toBeDefined();
    expect(ReactStore.container.resolve(App1).user1).toBe(
      ReactStore.container.resolve(App1).user1
    );
    expect(ReactStore.container.resolve(App1).user2).toBe(
      ReactStore.container.resolve(App1).user2
    );
    expect(ReactStore.container.resolve(App1).user1.username).toBe("user1");
    expect(ReactStore.container.resolve(App1).user2.username).toBe("user2");
    expect(ReactStore.container.resolve(App2).user1.username).toBe("user1");
    expect(ReactStore.container.resolve(App2).user2.username).toBe("user2");
  });

  it("should remove singleton instance", () => {
    @Injectable()
    class App {
      username = "test";
    }

    expect(ReactStore.container.resolve(App)).toBeDefined();
    const app1 = ReactStore.container.resolve(App);
    ReactStore.container.clear();
    const app2 = ReactStore.container.resolve(App);
    expect(app2).toBeDefined();
    expect(app1).not.toBe(app2);
  });

  it("should can remove class instance from container", () => {
    let createCount = 0;

    @Injectable()
    class A {
      constructor() {
        createCount++;
      }
    }
    ReactStore.container.resolve(A);
    ReactStore.container.remove(A);
    ReactStore.container.resolve(A);
    expect(createCount).toBe(2);
  });

  describe("Scope", () => {
    it("should resolve deps with default scope (singleton)", () => {
      @Injectable()
      class App {
        p1 = Math.random();
      }
      expect(ReactStore.container.resolve(App)).toBeInstanceOf(App);
      expect(ReactStore.container.resolve(App)).toBe(
        ReactStore.container.resolve(App)
      );
      expect(ReactStore.container.resolve(App).p1).toBe(
        ReactStore.container.resolve(App).p1
      );
    });

    it("should resolve deps with transient scope", () => {
      @Injectable(Scope.TRANSIENT)
      class App {
        p1 = Math.random();
      }
      expect(ReactStore.container.resolve(App)).toBeInstanceOf(App);
      expect(ReactStore.container.resolve(App)).not.toBe(
        ReactStore.container.resolve(App)
      );
      expect(ReactStore.container.resolve(App).p1).not.toBe(
        ReactStore.container.resolve(App).p1
      );
    });
  });

  it("should @Inject param decorator override dependencies", () => {
    @Injectable()
    class A {}

    @Injectable()
    class B {}

    @Injectable()
    class C {
      constructor(public injector: Injector, @Inject(B) public a: A) {}
    }

    const c = ReactStore.container.resolve(C);
    expect(c.a).toBeInstanceOf(B);
  });

  describe("Injector", () => {
    it("should inject injector class instance", () => {
      expect.assertions(1);
      @Injectable()
      class UserService {
        constructor(injector: Injector) {
          expect(injector).toBeInstanceOf(Injector);
        }
      }
      ReactStore.container.resolve(UserService);
    });

    it("should resolve dependency with injector", () => {
      expect.assertions(1);
      @Injectable()
      class UserService {}

      @Injectable()
      class ToDoService {
        constructor(injector: Injector) {
          expect(injector.get(UserService)).toBeInstanceOf(UserService);
        }
      }
      ReactStore.container.resolve(ToDoService);
    });

    it("should resolve dependency with injector in lazy mode", () => {
      expect.assertions(1);
      let wait: Promise<any>;

      @Injectable()
      class UserService {}

      @Injectable()
      class ToDoService {
        constructor(injector: Injector) {
          wait = injector.getLazy(UserService).then((userService) => {
            expect(userService).toBeInstanceOf(UserService);
          });
        }
      }
      ReactStore.container.resolve(ToDoService);
      return wait!;
    });

    it("should resolve dependency with injector with circular deps", () => {
      expect.assertions(2);

      let resolve;
      const wait = new Promise((res) => {
        resolve = res;
      });

      @Injectable()
      class UserService {
        constructor(injector: Injector) {
          injector.getLazy(ToDoService).then((toDoService) => {
            expect(toDoService).toBeInstanceOf(ToDoService);
            resolve();
          });
        }
      }

      @Injectable()
      class ToDoService {
        constructor(userService: UserService) {
          expect(userService).toBeInstanceOf(UserService);
        }
      }
      ReactStore.container.resolve(ToDoService);

      return wait;
    });
  });

  describe("Inheritance", () => {
    it("should inject dependencies from parent class", () => {
      @Injectable()
      class A {}

      @Injectable()
      class B {
        constructor(public a: A) {}
      }

      @Injectable()
      class C extends B {}

      const c = ReactStore.container.resolve(C);
      expect(c.a).toBeInstanceOf(A);
    });

    it("should inject dependencies from main class and ignore parent class dependencies", () => {
      @Injectable()
      class A1 {}

      @Injectable()
      class A2 {}

      @Injectable()
      class B {
        constructor(public a1: A1) {}
      }

      @Injectable()
      class C extends B {
        constructor(public a2: A2, public a1: A1) {
          super(a1);
        }
      }

      const c = ReactStore.container.resolve(C);
      expect(c.a1).toBeInstanceOf(A1);
      expect(c.a2).toBeInstanceOf(A2);
    });
  });

  describe("Injection Errors And Warnings", () => {
    it("should throw error if class is not decorated wit @Injectable()", () => {
      expect.assertions(1);

      try {
        class A {}
        ReactStore.container.resolve(A);
      } catch (error: any) {
        expect(error.message).toBe(
          "`class A` has not been decorated with @Injectable()"
        );
      }
    });

    it("should throw error if @Inject class decorator and @Injectable with access to decorator meta data is used simultaneously", () => {
      expect.assertions(1);
      try {
        @Injectable()
        class A {}

        @Inject(A)
        @Injectable()
        class B {
          constructor(@Inject(A) a: A) {}
        }

        ReactStore.container.resolve(B);
      } catch (error: any) {
        expect(error.message).toBe(
          "Dependencies are injecting by @Inject() as parameter and class decorator for `class B`. Use one of them."
        );
      }
    });

    it("should show warning for auto dependency detection and explicit @Inject(...)", () => {
      const warnMock = jest.spyOn(console, "warn").mockImplementation();
      expect.assertions(1);
      @Injectable()
      class A {}

      @Injectable()
      @Inject(A)
      class B {
        constructor(a: A) {}
      }
      expect(warnMock).toHaveBeenLastCalledWith(
        "Dependencies are automatically detected for `class B`. Remove @Inject(...)"
      );
      ReactStore.container.resolve(B);
    });
  });

  describe("Without Decorator Metadata", () => {
    it("should inject dependencies with class @Inject(...) decorator", () => {
      const getOwnMetadata = Reflect.getOwnMetadata;
      jest
        .spyOn(Reflect, "getOwnMetadata")
        .mockImplementation((mdKey, target) =>
          mdKey === "design:paramtypes" ? null : getOwnMetadata(mdKey, target)
        );

      @Injectable()
      class A {}

      @Inject(A)
      @Injectable()
      class B {
        constructor(public a: A) {}
      }

      const b = ReactStore.container.resolve(B);
      expect(b.a).toBeInstanceOf(A);
      expect(Reflect.getOwnMetadata("design:paramtypes", B)).toBeNull();
    });
  });
});
