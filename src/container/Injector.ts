import { getFromContainer } from "./container";
import { Injectable } from "src/decorators/Injectable";
import { ClassType } from "src/types";

@Injectable()
export class Injector {
  get<T extends ClassType = any>(type: T) {
    return getFromContainer<T>(type);
  }

  getLazy<T extends ClassType = any>(type: T) {
    return new Promise<InstanceType<T>>((res) =>
      setTimeout(() => res(getFromContainer<T>(type)), 0)
    );
  }
}
