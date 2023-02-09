// import { ReactApplicationContext } from "./appContext";
import { ReactApplicationContext } from "./appContext";
import { container } from "./container/container";
import { getClassDependenciesType } from "./decorators/inject";
import { PrefetchMetadata } from "./decorators/preFetch";
import { ClassType } from "./types";
import { decoratorsMetadataStorage } from "./utils/decoratorsMetadataStorage";

export class ReactStore {
  static container: typeof container = container;

  static async preFetch(storeType: ClassType, initProperties: Record<any, any>) {
    const preFetchMethods = decoratorsMetadataStorage.get<PrefetchMetadata>(
      "PreFetch",
      storeType
    );
    const depsType = getClassDependenciesType(storeType);

    const storeInstance = new storeType();

    for (const m of preFetchMethods) {
      await Reflect.apply(storeInstance[m], storeInstance, []);
    }
    this.container
      .resolve(ReactApplicationContext)
      .prefetchedStores.set(storeType, storeInstance);
  }
}
