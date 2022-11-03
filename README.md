# React Store

![ci](https://github.com/amirqasemi74/react-store/actions/workflows/ci.yml/badge.svg)
![npm](https://img.shields.io/npm/dw/@react-store/core)
![version](https://img.shields.io/npm/v/@react-store/core)

**React Store** is a state management library for React which facilitates to split components into smaller
and maintainable ones then share `States` between them and also let developers to use `class`es to manage
their components logic alongside it's IOC container.

## Table of content

- [Installation](#installation)
- [Usage](#usage)
- [Effects](#effects)
- [Props](#props)
- [Store Part](#store-part)
- [Computed Property](#computed-property)
- [Dependency Injection](#dependency-injection)

## Installation

First install core library:

`yarn add @react-store/core`

Then enable **decorators** and **decorators metadata** in typescript:

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
}
```

You can also use other javascript transpilers such as babel.

> See `example` folder for those how use Create-React-App

## Usage

Now it's ready. First create a `Store`:

```ts
// user.store.ts
import { Store } from "@react-store/core";

@Store()
class UserStore {
  name: string;

  onNameChange(e: ChangeEvent) {
    this.name = e.target.value;
  }
}
```

Then connect it to the component **tree** by using `connect` function as component wrapper, call `useStore` and pass it **store class** to access store instance:

```tsx
// App.tsx
import { connect, useStore } from "@react-store/core";

interface Props {
  p1: string;
}

const App = connect((props: Props) => {
  const st = useStore(UserStore);
  return (
    <div>
      {st.name}
      <Input />
    </div>
  );
}, UserStore);
```

And enjoy to use store in child components.

```jsx
import { useStore } from "@react-store/core";

function Input() {
  const st = useStore(UserStore);
  return (
    <div>
      <span>Name is: </span>
      <input onChange={st.onNameChange} />
    </div>
  );
}
```

## Store property & method

- _Property_: Each store property behind the sense is a `[state, setState] = useState(initVal)` it means when you set store property, actually you are doing `setState` and also when you read the property, actually you are reading the `state` but in reading scenario if you have been mutated `state` before reading it you will receive new value even before any rerender.

- _Method_: Store methods are used for state mutations. store methods are bound to store class instance by default. feel free to use them like below:

```tsx
function Input() {
  const st = useStore(UserStore);
  return <input onChange={st.onNameChange} />;
}
```

## Effects

You can manage side effects with `@Effect()` decorator. Like react `useEffect` dependency array you must define an array of dependencies.
<br>For **clear effect** you can return a function from this method.

```ts
@Store()
class UserStore {
  name: string;

  @Effect((_: UserStore) => [_.name])
  nameChanged() {
    console.log("name changed to:", this.name);
    return () => console.log("Clear Effect");
  }
}
```

You also can pass object as dependency item with **deep equal** mode. To do that, pass **true** as second parameters:

```ts
@Store()
export class UserStore {
  user = { name: "" };

  @Effect<UserStore>((_) => [_.user], true)
  usernameChanged() {
    console.log("name changed to:", this.name);
  }
}
```

Instead of passing a function to effect decorator to detect dependencies you can pass an array of paths<br>

```ts
@Store()
export class UserStore {
  user = { name: "" };

  @Effect(["user.name"])
  usernameChanged() {}

  // Only one dependency does not need to be warped by an array
  @Effect("user", true)
  userChanged() {}
}
```

## Memo

To memoize a value you can use `@Memo` decorator. Memo decorator parameters is like effect decorator:

```ts
@Store()
export class UserStore {
  user = { name: "", pass: "" };

  // @Memo(["user.name"])
  @Memo("user.name")
  get usernameLen() {
    return this.user.name.length;
  }

  @Memo(["user"], true)
  get passLen() {
    return this.user.pass;
  }
}
```

You can manage side effects with `@Effect()` decorator. Like react `useEffect` dependency array you must define an array of dependencies.
<br>For **clear effect** you can return a function from this method.

> Methods which decorate with `@Effect()` can be async, but if you want to return `clear effect` function make it sync method

## Props

To have store parent component props (the component directly connected to store by using `connect`) inside store class use `@Props()`:

```ts
// user.store.ts
import type { Props as AppProps } from "./App";
import { Props, Store } from "@react-store/core";

@Store()
export class UserStore {
  @Props()
  props: AppProps;
}
```

## Store Part

`Store Part` like store is a class which is decorated with `@StorePart()` and can **only** be connected to a store with `@Wire()` decorator.

```ts
@StorePart()
class Validator {
  object: Record<string, unknown>;

  hasError = false;

  @Effect("object", true)
  validate() {
    this.hasError = someValidator(object).hasError;
  }
}

@Store()
class UserForm {
  user: User;

  @Wire(Validator)
  validator: Validator;

  @Effect([])
  onMount() {
    this.validator.object = this.user;
  }

  onUsernameChange(username) {
    this.user.username = username;
  }
}
```

- Store part **can not** be used directly with `useStore` and must be wired to a store.
- Like store, store part can have it's effects, dependency injection.
- Store part is piece of logics and states can be wired to any other store and play a role like React `custom hooks`

## Computed Property

You can define getter in store class and automatically it will be a `computed` value. it means that if any underlying class properties which is used in
getter change, we will recompute getter value and cache it.

```ts
@Store()
class BoxStore {
  width: number;

  height: number;

  get area() {
    return (this.width + this.height) * 2;
  }
}
```

## Dependency Injection

In this library we have also supported dependency injection. To define `Injectable`s, decorate class with `@Injectable()`:

```ts
@Injectable()
class UserService {}
```

In order to inject dependencies into injectable, use `@Inject(...)`:

```ts
@Injectable()
@Inject(AuthService, UserService)
class PostService {
  constructor(private authService: AuthService, private userService: UserService) {}
}
```

Also you can use `@Inject()` as parameter decorator:

```ts
@Injectable()
@Inject(AuthService)
class PostService {
  constructor(
    private authService: AuthService,
    @Inject(UserService) private userService: UserService
  ) {}
}
```

Injection works fine for **stores**. Injectable can be injected into all stores. Also stores can be injected into other stores but there is one condition. For example, you want to inject `A` store into `B` store so the component which is wrapped with `connect(..., A)` must be higher in `B` store parent component. In other words, it works like React `useContext` rule.

```ts
@Injectable()
@Inject(AlertsStore)
class UserStore {
  constructor(private alertsStore: AlertsStore) {}
}
```
