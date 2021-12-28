import typescript from "@rollup/plugin-typescript";
import { resolve } from "path";
import ttypescript from "ttypescript";

const tsconfig = resolve(__dirname, "tsconfig.build.json");

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [typescript({ tsconfig, typescript: ttypescript })],
};
