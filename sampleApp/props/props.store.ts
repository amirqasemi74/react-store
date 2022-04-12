import { Props, Store } from "@react-store/core";

@Store()
export class PropsStore {
  @Props()
  props: any;

  a = 1;

  // @AutoEffect()
  fn() {
    // console.log(this.props);
    // console.log(this.props.obj.a);
  }
}
