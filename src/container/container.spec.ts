import { getFromContainer, clearContainer } from "./container";
import { Injectable, Scope } from "src/decorators/Injectable";
import { Inject } from "..";
import { Injector } from "./Injector";

describe("IOC Container", () => {
  beforeEach(() => {
    clearContainer();
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
      constructor(
        @Inject(UserInfo1) public user1: UserInfo1,
        @Inject(UserInfo2) public user2: UserInfo2
      ) {}
    }

    @Injectable()
    @Inject(UserInfo1, UserInfo2)
    class App2 {
      constructor(public user1: UserInfo1, public user2: UserInfo2) {}
    }

    expect(getFromContainer(App1).user1).toBeDefined();
    expect(getFromContainer(App1).user2).toBeDefined();
    expect(getFromContainer(App1).user1).toBe(getFromContainer(App1).user1);
    expect(getFromContainer(App1).user2).toBe(getFromContainer(App1).user2);
    expect(getFromContainer(App1).user1.username).toBe("user1");
    expect(getFromContainer(App1).user2.username).toBe("user2");
    expect(getFromContainer(App2).user1.username).toBe("user1");
    expect(getFromContainer(App2).user2.username).toBe("user2");
  });

  it("should remove singleton instance", () => {
    @Injectable()
    class App {
      username = "test";
    }

    expect(getFromContainer(App)).toBeDefined();
    const app1 = getFromContainer(App);
    clearContainer();
    const app2 = getFromContainer(App);
    expect(app2).toBeDefined();
    expect(app1).not.toBe(app2);
  });

  describe("Scope", () => {
    it("should resolve deps with default scope Singelton", () => {
      @Injectable()
      class App {
        p1 = Math.random();
      }
      expect(getFromContainer(App)).toBeInstanceOf(App);
      expect(getFromContainer(App)).toBe(getFromContainer(App));
      expect(getFromContainer(App).p1).toBe(getFromContainer(App).p1);
    });

    it("should resolve deps with transient scope", () => {
      @Injectable({ scope: Scope.TRANSIENT })
      class App {
        p1 = Math.random();
      }
      expect(getFromContainer(App)).toBeInstanceOf(App);
      expect(getFromContainer(App)).not.toBe(getFromContainer(App));
      expect(getFromContainer(App).p1).not.toBe(getFromContainer(App).p1);
    });
  });

  describe("Injector", () => {
    it("should inject injector class instance", () => {
      expect.assertions(1);
      @Injectable()
      class UserService {
        constructor(@Inject(Injector) injector: Injector) {
          expect(injector).toBeInstanceOf(Injector);
        }
      }
      getFromContainer(UserService);
    });

    it("should resolve dependency with injector", () => {
      expect.assertions(1);
      @Injectable()
      class UserService {}

      @Injectable()
      class ToDoService {
        constructor(@Inject(Injector) injector: Injector) {
          expect(injector.get(UserService)).toBeInstanceOf(UserService);
        }
      }
      getFromContainer(ToDoService);
    });

    it("should resolve dependency with injector in lazy mode", () => {
      expect.assertions(1);
      let wait: Promise<any>;

      @Injectable()
      class UserService {}

      @Injectable()
      class ToDoService {
        constructor(@Inject(Injector) injector: Injector) {
          wait = injector.getLazy(UserService).then((userService) => {
            expect(userService).toBeInstanceOf(UserService);
          });
        }
      }
      getFromContainer(ToDoService);
      return wait!;
    });

    it("shotuld resolve dependency with injector with circular deps", () => {
      expect.assertions(2);

      let resolve;
      const wait = new Promise((res) => {
        resolve = res;
      });

      @Injectable()
      class UserService {
        constructor(@Inject(Injector) injector: Injector) {
          injector.getLazy(ToDoService).then((toDoService) => {
            expect(toDoService).toBeInstanceOf(ToDoService);
            resolve();
          });
        }
      }

      @Injectable()
      class ToDoService {
        constructor(@Inject(UserService) userService: UserService) {
          expect(userService).toBeInstanceOf(UserService);
        }
      }
      getFromContainer(ToDoService);

      return wait;
    });
  });
});
