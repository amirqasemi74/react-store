import { getFromContainer, clearContainer } from ".";
import { Injectable } from "src/decorators/Injectable";

describe("Container", () => {
  beforeEach(() => {
    clearContainer();
  });

  it("should return singleton instance", () => {
    @Injectable
    class App {
      p1 = Math.random();
    }
    expect(getFromContainer(App)).toBeInstanceOf(App);
    expect(getFromContainer(App)).toBe(getFromContainer(App));
    expect(getFromContainer(App).p1).toBe(getFromContainer(App).p1);
  });

  it("should resolve dependencies automatically", () => {
    @Injectable
    class UserInfo {
      username = "amir.qasemi74";
      password = "123456";
    }

    @Injectable
    class App {
      constructor(public user: UserInfo) {}
    }

    getFromContainer(UserInfo);
    expect(getFromContainer(App).user).toBeDefined();
    expect(getFromContainer(App).user).toBe(getFromContainer(App).user);
    expect(getFromContainer(App).user.username).toBe("amir.qasemi74");
  });

  it("should remove singleton instance", () => {
    @Injectable
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
