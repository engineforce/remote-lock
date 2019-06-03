const nodeExternals = require('webpack-node-externals')

/** @type {import('webpack').Configuration} */
module.exports = {
  // target: 'node',
  devtool: false,
  mode: 'development',
  // externals: {
  //   'remote-lock': 'remoteLock',
  // },
  output: {
    library: 'redisRemoteLock',
    libraryTarget: 'umd',
    filename: 'index.js',
    pathinfo: true,
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
}
