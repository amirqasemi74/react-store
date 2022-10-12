import { Inject, Injectable, ReactStore } from "../src";

describe("Define Injectable", () => {
  beforeEach(() => {
    ReactStore.container.clear();
  });

  it("should define injectable using value", () => {
    expect.assertions(1);

    const CurrentUser = () => Inject("CURRENT_USER");

    ReactStore.container.defineInjectable({
      token: "CURRENT_USER",
      value: "amir.qasemi74",
    });

    @Injectable()
    class PostService {
      constructor(@CurrentUser() currentUser: string) {
        expect(currentUser).toBe("amir.qasemi74");
      }
    }

    ReactStore.container.resolve(PostService);
  });

  it("should define injectable using class when token is class", () => {
    expect.assertions(2);

    @Injectable()
    class User {
      username?: string;
    }

    class AmirUser {
      username = "amir.qasemi74";
    }

    ReactStore.container.defineInjectable({
      token: User,
      class: AmirUser,
    });

    @Injectable()
    class PostService {
      constructor(user: User) {
        expect(user).toBeInstanceOf(AmirUser);
        expect(user.username).toBe("amir.qasemi74");
      }
    }

    ReactStore.container.resolve(PostService);
  });

  it("should define injectable using class when token is string or symbol", () => {
    expect.assertions(2);

    const CurrentUser = Symbol();

    class User {
      username = "amir.qasemi74";
    }

    ReactStore.container.defineInjectable({
      token: CurrentUser,
      class: User,
    });

    @Injectable()
    class PostService {
      constructor(@Inject(CurrentUser) user: User) {
        expect(user).toBeInstanceOf(User);
        expect(user.username).toBe("amir.qasemi74");
      }
    }

    ReactStore.container.resolve(PostService);
  });

  it("should define injectable using factory", () => {
    expect.assertions(2);

    @Injectable()
    class UserService {
      getUsername() {
        return "amir.qasemi74";
      }
    }

    @Injectable()
    class User {
      username: string;
    }

    ReactStore.container.defineInjectable({
      token: User,
      inject: [UserService],
      factory: (userService: UserService) => {
        const user = new User();
        user.username = userService.getUsername();
        return user;
      },
    });

    @Injectable()
    class PostService {
      constructor(user: User) {
        expect(user).toBeInstanceOf(User);
        expect(user.username).toBe("amir.qasemi74");
      }
    }

    ReactStore.container.resolve(PostService);
  });
});
