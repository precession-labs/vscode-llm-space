const fs = require("fs");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const Webpackbar = require("webpackbar");

const ROOT_PATH = fs.realpathSync(process.cwd());
const BUILD_PATH = path.join(ROOT_PATH, "dist");

/** @type { import('webpack').Configuration } WebpackConfig */
module.exports = {
  context: ROOT_PATH,
  mode: "production",
  target: "node",
  node: {
    __dirname: false,
  },
  entry: {
    extension: ["./src/extension"],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: { comments: false },
        },
      }),
    ],
  },
  output: {
    path: BUILD_PATH,
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: {
    vscode: "commonjs vscode",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: { transpileOnly: true },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin(), new Webpackbar()],
  stats: {
    children: false,
    modules: false,
  },
};
