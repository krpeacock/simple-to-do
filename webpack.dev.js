const HtmlWebpackPlugin = require("html-webpack-plugin");

const prodConfig = require("./webpack.config")[0];
const path = require("path");

module.exports = {
  ...prodConfig,
  mode: "development",
  module: {
    ...prodConfig.module,
  },
  entry: {
    ic: path.join(__dirname, "src", "frontend", "ic.js"),
    ...prodConfig.entry,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
    }),
  ],
  devServer: {
    contentBase: "src/frontend",
    hot: true,
    proxy: {
      "/api": "http://localhost:8000",
      "/bls.wasm": "http://localhost:8000",
    },
  },
};
