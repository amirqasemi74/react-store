# React Store

**React Store** is a library for better state management in react hooks new world.

It facilitates to split components into smaller and maintainable ones then share `States` between them.
It also covers shortcomings of react hooks (believe me!) and let developers to use `class`es to manage their components logic, use it's IOC container.
<br>The ability to separate components logics and jsx is one of other benefits of this library

# Usage

First install core library:

`yarn add @react-store/core` or `npm i @react-store/core`

Then enable **decorators** in typescript:

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
}
```

You can also use other javascript transpilers such as babel.

Now it's ready. First create a `Store`:

```ts
// user.store.ts
import { Store } from "@react-store/core";

@Store()
export class UserStore {
  name: string;

  onNameChange(e: ChangeEvent) {
    this.name = e.target.value;
  }
}
```

Then connect it to the component **Tree** by using `connectStore`:

```tsx
// App.tsx
import { connectToStore, useStore } from "@react-store/core";

interface Props {
  p1: string;
}

function App(props: Props) {
  const st = useStore(UserStore);
  return (
    <div>
      {st.name}
      <Input />
    </div>
  );
}
export default connectStore(App, UserStore);
```

And enjoy to use store in child components by `useStore` hook. pass **Store Class** as first parameter:

```jsx
import { useStore } from "@react-store/core";

export default function Input() {
  const st = useStore(UserStore);
  return (
    <div>
      <span>Name is: </span>
      <input onChange={st.onNameChange} />
    </div>
  );
}
```

# Effects

You can manage side effects with `@Effect()` decorator. Like react dependency array you must return array of dependency.
<br>For **clear effects** again like React useEffect you can return a function from methods which is decorated with @Effect.

```ts
@Store()
export class UserStore {
  name: string;

  @Effect((_: UserStore) => [_.name])
  nameChanged() {
    console.log("name changed to:", this.name);

    return () => console.log("Clear Effect");
  }
}
```

You can also pass object as dependency with **deep equal** mode. just pass **true** as second parameters:

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

Instead of passing a function to effect to detect dependencies you can pass an array of strings or just one string.<br>
The string can be an object path to define dependencies:

```ts
@Store()
export class UserStore {
  user = { name: "" };

  @Effect<UserStore>(["user.name"])
  usernameChanged() {}

  @Effect<UserStore>("user", true)
  userChanged() {}
}
```

#### Store property & method

- _Property_: Each store property can act like piece of component state and mutating their values will rerender _all_ store users as react context API works. Also in more precise way you can declare _dependencies_ for each user of store to prevent additional rendering and optimization purposes. we will talk about more.

- _Method_: Store methods like Redux actions uses for state mutations. A good practice is to write logics and state mutation codes inside store class methods and use them in components. as you will guess directly mutating state from components will be a bad practice.
  Store methods are bound to store class instance by default. feel free to use them like below:

```tsx
function Input() {
  const st = useStore(UserStore);
  return <input onChange={st.onNameChange} />;
}
```

#### Props in store

To have parent component props (the component directly connected to store by using `connectStore` function) inside store class use `@Props`:

```ts
// user.store.ts
import { Props as AppProps } from "./App";
import { Props, Store } from "@react-store/core";

@Store()
export class UserStore {
  @Props()
  props: AppProps;
}
```
