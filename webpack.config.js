var path = require('path')
var webpack = require('webpack')
var webpackMerge = require('webpack-merge')

var baseConfig = {
  target: 'async-node',
  entry: {
    entry: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    library: 'catchment-area',
    libraryTarget: 'umd'
  }
}

let targets = ['web', 'node', 'async-node'].map((target) => {
  let base = webpackMerge(baseConfig, {
    target: target,
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name].' + target + '.js'
    }
  })
  return base
})

module.exports = targets
