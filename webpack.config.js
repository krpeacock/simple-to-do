const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const dfxJson = require("./dfx.json");
require("dotenv").config();

let localCanister;

try {
  localCanister = require("./.dfx/local/canister_ids.json").simple_to_do.local;
} catch {}

// List of all aliases for canisters. This creates the module alias for
// the `import ... from "@dfinity/ic/canisters/xyz"` where xyz is the name of a
// canister.
const aliases = Object.entries(dfxJson.canisters).reduce(
  (acc, [name, _value]) => {
    // Get the network name, or `local` by default.
    const networkName = process.env["DFX_NETWORK"] || "local";
    const outputRoot = path.join(
      __dirname,
      ".dfx",
      networkName,
      "canisters",
      name
    );

    return {
      ...acc,
      ["dfx-generated/" + name]: path.join(outputRoot, name + ".js"),
    };
  },
  {}
);

/**
 * Generate a webpack configuration for a canister.
 */
function generateWebpackConfigForCanister(name, info) {
  const isProduction = process.env.NODE_ENV === "production";
  const devtool = isProduction ? undefined : "source-map";

  process.env.CANISTER_ID = process.env.CANISTER_ID || localCanister;

  return {
    mode: isProduction ? "production" : "development",
    entry: {
      index: path.join(__dirname, "src", "frontend", "index"),
    },
    name,
    devtool,
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin()],
    },
    resolve: {
      alias: aliases,
      extensions: [".js", ".ts", ".jsx", ".tsx"],
      fallback: {
        buffer: require.resolve("buffer/"),
        // events: require.resolve("events/"),
        // stream: require.resolve("stream-browserify/"),
      },
    },
    output: {
      filename: "[name].js",
      path: path.join(__dirname, "dist"),
    },
    devServer: {
      port: 8080,
      proxy: {
        "/api": "http://localhost:8000",
      },
    },

    // Depending in the language or framework you are using for
    // front-end development, add module loaders to the default
    // webpack configuration. For example, if you are using React
    // modules and CSS as described in the "Adding a stylesheet"
    // tutorial, uncomment the following lines:
    module: {
      rules: [{ test: /\.(ts|tsx)$/, loader: "ts-loader" }],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(
          __dirname,
          "src",
          "frontend",
          "assets",
          "index.html"
        ),
        filename: "index.html",
        chunks: ["index"],
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, "src", "frontend", "assets"),
            to: path.join(__dirname, "dist"),
          },
        ],
      }),
      new webpack.ProvidePlugin({
        Buffer: [require.resolve("buffer/"), "Buffer"],
      }),
      new webpack.EnvironmentPlugin(["CANISTER_ID"]),
      new CompressionPlugin({
        test: /\.js(\?.*)?$/i,
      }),
    ],
  };
}

// If you have additional webpack configurations you want to build
//  as part of this configuration, add them to the section below.
module.exports = [
  ...Object.entries(dfxJson.canisters)
    .map(([name, info]) => {
      return generateWebpackConfigForCanister(name, info);
    })
    .filter((x) => !!x),
];
