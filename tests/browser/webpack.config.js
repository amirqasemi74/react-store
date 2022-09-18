const HtmlWebpackPlugin = require("html-webpack-plugin");
const { resolve } = require("path");

const srcDir = resolve(__dirname, "../../src");
const sampleAppDir = resolve(__dirname);

module.exports = {
  devtool: "source-map",
  entry: resolve(sampleAppDir, "index.tsx"),
  mode: "development",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "@react-store/core": srcDir,
      sampleApp: sampleAppDir,
      src: srcDir,
    },
  },
  output: {
    publicPath: "/",
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
      template: resolve(sampleAppDir, "index.html"),
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),
  ],
  devServer: {
    port: 5000,
    historyApiFallback: true,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};