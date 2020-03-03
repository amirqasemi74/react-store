import { observe } from "src/observability";
import { getType } from "src/utils/utils";

interface Args {
  id?: string;
  instance: object;
}

export default class Store {
  id?: string;

  type: Function;

  instance: any;

  rerender: Function;

  constructor({ id, instance }: Args) {
    this.id = id;
    this.type = getType(instance);
    this.instance = observe(instance, this);
  }
}
