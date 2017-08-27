const WebpackStrip = require('strip-loader');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const loadBabel = require('./babel');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {
  DIST,
  PUBLIC,
  COMPILED_ASSETS_PUBLIC_PATH,
  BABEL_CLIENT,
  CONTENT,
  DIST_CONTENT_PATH
} = require('../config/paths');
const defaultConfig = require('./webpack.common');
const { publicAssets } = require('../config/environment');

const babelrc = loadBabel(BABEL_CLIENT);

const prodConfig = Object.assign({}, defaultConfig, {
  output: {
    path: `${DIST}/${COMPILED_ASSETS_PUBLIC_PATH}`,
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].chunk.js',
    publicPath: `${publicAssets}/${COMPILED_ASSETS_PUBLIC_PATH}`
  }
});

prodConfig.module.loaders.push({
  test: /\.jsx?$/,
  include: [/src/],
  loader: [{
    loader: 'babel-loader',
    query: babelrc
  }, WebpackStrip.loader('console.log', 'console.debug')],
});

// extract styles as single file
prodConfig.plugins.push(
  new ExtractTextPlugin({
    filename: '[name].[contenthash].css',
    allChunks: true
  })
);
// copy content of PUBLIC folder to dist.
// it is expectec to have only static assets
prodConfig.plugins.push(
  new CopyWebpackPlugin([
    { from: PUBLIC, to: DIST, ignore: '**/.*' },
    { from: CONTENT, to: DIST_CONTENT_PATH, ignore: '**/.*' }
  ])
);

module.exports = prodConfig;
