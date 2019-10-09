const path = require('path')

module.exports = () => ({
  entry: {
    web: './src/web/index.js',
    hook: './src/hook/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: 'babel-loader',
        include: [path.join(__dirname, './src'), path.join(__dirname, './node_modules/proxyee-down-extension-sdk')]
      }
    ]
  }
})
