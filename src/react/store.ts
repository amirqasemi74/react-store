import { observe } from "src/observability";
import { getType } from "src/utils/utils";

export default class Store {
  id?: string;

  type: Function;

  instance: any;

  consumers: StoreConsumer[] = [];

  constructor({ id, instance }: Args) {
    this.id = id;
    this.type = getType(instance);
    this.instance = observe(instance, this);
  }
}

interface Args {
  id?: string;
  instance: object;
}

interface StoreConsumer {
  forceUpdate: Function;
}
