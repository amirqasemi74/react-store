import { AutoEffect, Props, Store } from "@react-store/core";

@Store()
export class PropsStore {
  @Props()
  props: any;

  @AutoEffect()
  fn() {
    console.log(this.props.obj.a);
  }
}
