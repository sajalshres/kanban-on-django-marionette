const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, options) => {
  console.log(`Webpack build for ${options.mode}`);
  const srcFolder = path.join(__dirname, "src");
  buildFolder = path.resolve(__dirname, "..", "backend", "static", "build");

  return {
    mode: options.mode,
    entry: { main: [path.join(srcFolder, "main")] },
    output: {
      path: buildFolder,
      filename: "[name].built.js",
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          exclude: /node_modules/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            { loader: "css-loader" },
            {
              // Run postcss actions
              loader: "postcss-loader",
              options: {
                // `postcssOptions` is needed for postcss 8.x;
                // if you use postcss 7.x skip the key
                postcssOptions: {
                  // postcss plugins, can be exported to postcss.config.js
                  plugins: function () {
                    return [require("autoprefixer")()];
                  },
                },
              },
            },
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
              },
            },
          ],
        },
        {
          test: /\.(ttf|eot|svg|png|jpg|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              loader: "file-loader",
            },
          ],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: "file-loader",
            },
          ],
        },
        {
          test: /\.pug$/i,
          loader: "pug-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage",
                    corejs: 3,
                  },
                ],
              ],
              plugins: [["@babel/plugin-proposal-class-properties"]],
            },
          },
        },
      ],
    },
    plugins: [new MiniCssExtractPlugin({ filename: "styles.css" })],
  };
};
