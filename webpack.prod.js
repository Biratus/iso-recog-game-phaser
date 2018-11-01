const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

process.env.WEBGL_RENDERER=true
process.env.CANVAS_RENDERER=false

module.exports = merge(common, {
  output: {
    publicPath () {
      switch (process.env.PLATFORM) {
        case 'android':
          return 'file:///android_asset/'
        case 'web':
          return '/'
        default:
          throw new Error('PLATFORM environment variable is not defined!')
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(['build' + '/' + process.env.PLATFORM]),
    new CopyWebpackPlugin(['assets']),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      templateParameters: {
        webglRenderer: process.env.WEBGL_RENDERER === 'true',
        canvasRenderer: process.env.CANVAS_RENDERER === 'true'
      },
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeComments: true,
        removeEmptyAttributes: true
      }
    }),
    new UglifyJsPlugin({
      parallel: 8,
      cache: true,
      uglifyOptions: {
        output: {
          beautify: false,
          comments: false
        }
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.PLATFORM': JSON.stringify(process.env.PLATFORM || 'web')
    })
  ],
  mode: 'production'
})
