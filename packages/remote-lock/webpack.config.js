const nodeExternals = require('webpack-node-externals')

/** @type {import('webpack').Configuration} */
module.exports = {
  devtool: false,
  mode: 'development',
  externals: [nodeExternals()],
  output: {
    library: 'remoteLock',
    libraryTarget: 'umd',
    filename: 'index.js',
    pathinfo: true,
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
  },
}
