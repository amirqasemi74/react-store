import { getFromContainer, clearContainer } from "./container";
import { Injectable } from "src/decorators/Injectable";
import { Inject } from "..";

describe("Container", () => {
  beforeEach(() => {
    clearContainer();
  });

  it("should return singleton instance", () => {
    @Injectable()
    class App {
      p1 = Math.random();
    }
    expect(getFromContainer(App)).toBeInstanceOf(App);
    expect(getFromContainer(App)).toBe(getFromContainer(App));
    expect(getFromContainer(App).p1).toBe(getFromContainer(App).p1);
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
});
