const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const utils = require('./utils');
const loadBabel = require('./babel');
const { publicAssets } = require('../config/environment');
const vendor = require('./vendor');
const {
  COMPILED,
  SRC,
  DIST,
  COMPILED_ASSETS_PUBLIC_PATH,
  WEBPACK_ASSET_FILE_NAME,
  WEBPACK_ASSET_FILE_FOLDER,
  BABEL_CLIENT
} = require('../config/paths');
require('./metadata');

const releaseHash = require(`${COMPILED}/metadata.json`).release; // eslint-disable-line

const babelrc = loadBabel(BABEL_CLIENT);
const babelPlugins = babelrc.plugins;

if (utils.isProduction()) {
  babelPlugins.push('transform-react-remove-prop-types');
}

Object.assign(babelrc, {
  plugins: babelPlugins
});

module.exports = {
  entry: {
    vendor,
    app: [`${SRC}/client-entry.js`]
  },
  performance: false,
  devtool: utils.isProduction() ? 'hidden-source-map' : 'source-map',
  output: {
    path: `${DIST}/${COMPILED_ASSETS_PUBLIC_PATH}`,
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: `${publicAssets}/${COMPILED_ASSETS_PUBLIC_PATH}`
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.PORT': JSON.stringify(process.env.PORT),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.RELEASE_HASH': JSON.stringify(releaseHash)
    }),
    new AssetsPlugin({
      filename: WEBPACK_ASSET_FILE_NAME,
      path: WEBPACK_ASSET_FILE_FOLDER,
      includeManifest: 'manifest',
      prettyPrint: true
    }),
    new webpack.LoaderOptionsPlugin({
      sass: {
        includePaths: [
          path.resolve(__dirname, '../src/styles/')
        ]
      }
    })
  ],
  resolve: {
    modules: ['node_modules', SRC],
    extensions: ['.js', '.jsx', '.json', '.scss']
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.jsx?$/,
        include: [/src/],
        loader: 'babel-loader',
        query: babelrc
      },
      {
        test: /\.css$/,
        include: [/src/],
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader']
        })
      },
      {
        test: /\.scss$/,
        include: [/src/],
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader?sourceMap', 'sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true', 'postcss-loader?sourceMap=true']
        })
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot)$/,
        loader: 'url-loader',
        query: {
          name: '[hash].[ext]',
          limit: 10000
        }
      },
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        loader: 'url-loader'
      },
      {
        test: /\.(eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
        query: {
          name: '[hash].[ext]'
        }
      }
    ]
  }
};
