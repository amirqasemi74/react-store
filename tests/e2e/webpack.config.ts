import path from "node:path";
import { ProvidePlugin } from "webpack";

const srcDir = path.resolve(__dirname, "../../src");

module.exports = {
  mode: "development",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      src: srcDir,
      "@react-store/core": srcDir,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
  plugins: [
    new ProvidePlugin({
      React: "react",
    }),
  ],
};
