import { ORIGINAL_TARGET } from "src/constant";

const fd = (value: any) => {
  return value[ORIGINAL_TARGET];
};
export default fd;
