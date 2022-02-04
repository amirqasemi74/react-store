// import typescript from "@rollup/plugin-typescript";
import { resolve } from "path";
import typescript from "rollup-plugin-typescript2";
import ttypescript from "ttypescript";

const tsconfig = resolve(__dirname, "tsconfig.build.json");

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [typescript({ tsconfig, typescript: ttypescript })],
  external: [
    "dequal",
    "react",
    "react-dom",
    "lodash/get",
    "is-promise",
    "clone-deep",
    "reflect-metadata",
  ],
};
