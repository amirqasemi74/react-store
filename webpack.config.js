const HtmlWebpackPlugin = require("html-webpack-plugin");
const { resolve } = require("path");

const srcDir = resolve(__dirname, "src");
const sampeAppDir = resolve(__dirname, "sampleApp");

module.exports = {
  devtool: "source-map",
  entry: resolve(sampeAppDir, "index.tsx"),
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "react-over": srcDir,
      sampleApp: sampeAppDir,
      src: srcDir,
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
    new HtmlWebpackPlugin({
      template: resolve(sampeAppDir, "index.html"),
    }),
  ],
};
