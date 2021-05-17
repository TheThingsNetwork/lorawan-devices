// Copyright © 2021 The Things Network Foundation, The Things Industries B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const { CONTEXT = '.' } = process.env
const context = path.resolve(CONTEXT)
const CopyPlugin = require("copy-webpack-plugin");

const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : "http://localhost:9100"
const BASE_PATH = process.env.BASE_PATH ? process.env.BASE_PATH : "/device-repository"

module.exports = env => {
    const isProduction = Boolean(env && env.production)
    console.log('Production: ', isProduction)
    console.log(BASE_URL)
    console.log(BASE_PATH)

    return {
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? 'source-map' : 'inline-source-map',
        entry: {
          base: path.resolve(__dirname, 'src/js/index.js'),
          style: path.resolve(__dirname, 'src/styles/index.js'),
          device_single: path.resolve(__dirname, 'src/js/partials/device-single.js'),
        },
        output: {
            path: path.resolve(__dirname, 'static/'),
            filename: `js/${isProduction ? '[hash].' : ''}[name].js`,
            publicPath: BASE_PATH
        },
        resolve: {
          alias: {
            '@wof-webui': path.resolve(context, 'src/js/'),
            '@wof-assets': path.resolve(context, 'src/assets/'),
          },
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: `css/${isProduction ? '[hash].' : ''}[name].css`
            }),
            new WebpackManifestPlugin({
                fileName: '../data/manifest.json',
                publicPath: `${isProduction ? '/' : BASE_URL + BASE_PATH}`,
                writeToFileEmit: true
            }),
            new CopyPlugin([
              {
                from: "**/*",
                context: path.resolve(__dirname, "src", "assets/static"),
                to: "assets/" }
            ])
        ],
        devServer: {
            contentBase: path.join(__dirname, 'src'),
            port: 9100,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
              "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            }
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                {
                  test:  /\.(styl|css)$/,
                  use: [
                    // CSS loader for moduled css/styl from javascript
                    {
                      loader: 'style-loader', // Creates style nodes from JS strings
                    },
                    {
                      loader: 'css-loader',
                      options: { modules: true, localsConvention: 'camelCase' },
                    },

                    {
                      loader: 'stylus-loader',
                      options: {
                        import: [path.resolve(__dirname, 'src/js/styles/include.styl')],
                      },
                    },
                  ],
                  exclude: [path.resolve(__dirname,'./src/styles/')]
                },
                {
                  test:  /\.(styl|css)$/,
                  // CSS loader for non-moduled css use for static site content
                  use: [
                    {
                      loader: MiniCssExtractPlugin.loader
                    },
                    {
                      loader: 'css-loader',
                    },
                    {
                      loader: 'stylus-loader', // Compiles stylus to css
                    },
                  ],
                  include: [path.resolve(__dirname,'./src/styles/')]
                },
                {
                  test: /\.(png|woff|woff2|eot|ttf|svg|otf)$/,
                  use: [
                    {
                      loader: 'file-loader',
                      options: {
                        name: `assets/[name]${isProduction ? '.[contenthash]' : ''}.[ext]`,
                        publicPath: `${isProduction ? BASE_PATH : BASE_URL + BASE_PATH}`
                      },
                    },
                  ],
                },
            ]
        }
    }
}
