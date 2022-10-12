import { Scope } from "..";
import { InjectableMetadata } from "src/decorators/Injectable";
import { getClassDependenciesType } from "src/decorators/inject";
import { ClassType, Func } from "src/types";
import { decoratorsMetadataStorage } from "src/utils/decoratorsMetadataStorage";
import { isClass } from "src/utils/isClass";

class Container {
  private readonly instances = new Map<InjectableToken, unknown>();

  resolve<T>(token: InjectableToken<T>): T extends ClassType ? InstanceType<T> : T {
    const scope = isClass(token)
      ? decoratorsMetadataStorage.get<InjectableMetadata>("Injectable", token)[0]
      : Scope.SINGLETON;

    if (!scope) {
      if (isClass(token)) {
        throw new Error(
          `\`class ${token.name}\` has not been decorated with @Injectable()`
        );
      } else {
        throw new Error(`\`${token.toString()}\` can't be retrieved from container`);
      }
    }

    if (isClass(token)) {
      switch (scope) {
        case Scope.TRANSIENT: {
          //eslint-disable-next-line
          return new token(...this.resolveDependencies(token)) as any;
        }
        case Scope.SINGLETON:
        default: {
          let instance = this.instances.get(token);
          if (!instance) {
            instance = new token(...this.resolveDependencies(token));
            this.instances.set(token, instance);
          }
          //eslint-disable-next-line
          return instance as any;
        }
      }
    } else {
      //eslint-disable-next-line
      return this.instances.get(token) as any;
    }
  }

  resolveDependencies(someClass: ClassType) {
    // INJECTABLE
    return getClassDependenciesType(someClass).map((type) => this.resolve(type));
  }

  defineInjectable(
    injectable: //eslint-disable-next-line
    | { token: InjectableToken; value: any }
      | { token: InjectableToken; class: ClassType }
      | { token: InjectableToken; factory: Func; inject?: Array<InjectableToken> }
  ) {
    const token = injectable.token;
    if ("value" in injectable) {
      this.instances.set(token, injectable.value);
    } else if ("class" in injectable) {
      if (isClass(token)) {
        this.instances.set(
          token,
          new injectable.class(...this.resolveDependencies(token))
        );
      } else {
        this.instances.set(token, new injectable.class());
      }
    } else {
      this.instances.set(
        token,
        injectable.factory(...(injectable.inject || []).map((t) => this.resolve(t)))
      );
    }
  }

  remove(someClass: ClassType) {
    this.instances.delete(someClass);
  }

  clear() {
    this.instances.clear();
  }
}

export const container = new Container();

//eslint-disable-next-line
type InjectableToken<T = any> = string | symbol | ClassType<T>;
