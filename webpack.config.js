const HtmlWebpackPlugin = require("html-webpack-plugin");
const { resolve } = require("path");

const srcDir = resolve(__dirname, "src");
const testDir = resolve(__dirname, "test");

module.exports = {
  devtool: "source-map",
  entry: resolve(testDir, "index.ts"),
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "react-over": srcDir,
      src: srcDir,
      test: testDir
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(testDir, "index.html")
    })
  ]
};
