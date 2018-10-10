// const path = require('path')

module.exports = () => ({
  /*  entry: {
    home: './src/home.js',
    share: './src/share.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  }, */
  entry: ['./src/index.js'],
  module: {
    rules: [
      {
        test: /\.js/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
})
