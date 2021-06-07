import { render } from "@testing-library/react";
import React from "react";
import {
  connectStore,
  Store,
  Inject,
  Injectable,
  useStore,
} from "@react-store/core";

describe("Dependency injection", () => {
  it("should inject injectables into store", () => {
    expect.assertions(5);

    let userService!: UserService;

    @Injectable()
    class UserService {}

    @Injectable()
    class PostService {}

    @Store()
    @Inject(PostService, UserService)
    class PostStore {
      constructor(postService: PostService, userService: UserService) {
        expect(postService).toBeInstanceOf(PostService);
        expect(userService).toBeInstanceOf(UserService);
        userService = userService;
      }
    }

    @Store()
    @Inject(PostStore, UserService)
    class UserStore {
      username = "amir.qasemi74";
      password = "123456";

      constructor(postStore: PostStore, userService: UserService) {
        expect(postStore).toBeInstanceOf(PostStore);
        expect(userService).toBeInstanceOf(UserService);
        expect(userService).toBe(userService);
      }
    }

    const App = () => {
      const vm = useStore(UserStore);
      useStore(PostStore);
      return (
        <div>
          username: {vm.username}
          password: {vm.password}
        </div>
      );
    };
    const AppWithStore = connectStore(connectStore(App, UserStore), PostStore);
    render(<AppWithStore />);
  });
});
