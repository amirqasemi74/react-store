import { Injectable, ReactStore } from "..";
import { ClassType } from "src/types";

@Injectable()
export class Injector {
  get<T extends ClassType>(token: T) {
    return ReactStore.container.resolve<T>(token);
  }

  getLazy<T extends ClassType>(token: T) {
    return new Promise<InstanceType<T>>((res) =>
      setTimeout(() => res(ReactStore.container.resolve<T>(token)), 0)
    );
  }
}
