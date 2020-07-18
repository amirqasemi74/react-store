import ttypescript from "ttypescript";
import typescript from "@rollup/plugin-typescript";
import { resolve } from "path";

const tsconfig = resolve(__dirname, "tsconfig.build.json");

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [typescript({ tsconfig, typescript: ttypescript })],
};
