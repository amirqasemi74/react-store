# React Store

React Store is a library for better state managment in react hooks new world.

It facilitates to share `states` between components. This library uses react Context API and typescript decorators to make a better react application.

## Usage

First install it:
`yarn add @react-store/core`
then enable decorators in typescript:

```json
{
  "compilerOptions": {
   ...
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
	...
}
```

now it's ready. first create a `store`:

```javascript
import { ContextStore } from "@react-store/core";

@ContextStore()
class UserStore {
  name: string;

  onNameChange(e: ChangeEvent) {
    this.name = e.target.value;
  }
}
```

then connect it component:

```javascript
import { connectToStore, useStore } from "@react-store/core"

fucntion App() {
	const vm = useStore(UserStore);
	return (<div>
		{vm.name}
		<Input/>
	</div>);
}
export default connectToStore(App, UserStore);
```

and use store in childrens:

```javascript
import { useStore  } from "@react-store/core"

export default fucntion Input() {
	const vm = useStore(UserStore);
	return <input onChange={vm.onNameChange} />;
}
```
