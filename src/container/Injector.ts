import { Injectable } from "..";
import { getFromContainer } from "./container";
import { ClassType } from "src/types";

@Injectable()
export class Injector {
  get<T extends ClassType>(type: T) {
    return getFromContainer<T>(type);
  }

  getLazy<T extends ClassType>(type: T) {
    return new Promise<InstanceType<T>>((res) =>
      setTimeout(() => res(getFromContainer<T>(type)), 0)
    );
  }
}
