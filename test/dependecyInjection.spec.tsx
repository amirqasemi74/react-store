import { render } from "@testing-library/react";
import React from "react";
import {
  connectStore,
  ContextStore,
  Inject,
  Injectable,
  useStore,
} from "@react-store/core";

describe("Dependency injection", () => {
  it("should inject injectables into store", () => {
    let userServiceRef;
    @Injectable()
    class UserService {}

    @Injectable()
    class PostService {}

    @ContextStore()
    @Inject(PostService, UserService)
    class UserStore {
      username = "amir.qasemi74";
      password = "123456";

      constructor(postService: PostService, userService: UserService) {
        expect(postService).toBeInstanceOf(PostService);
        expect(userService).toBeInstanceOf(UserService);
        expect(userServiceRef).toBe(userService);
      }
    }

    @ContextStore()
    @Inject(PostService, UserService)
    class PostStore {
      constructor(postService: PostService, userService: UserService) {
        expect(postService).toBeInstanceOf(PostService);
        expect(userService).toBeInstanceOf(UserService);
        userServiceRef = userService;
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
    const { debug } = render(<AppWithStore />);
  });
});