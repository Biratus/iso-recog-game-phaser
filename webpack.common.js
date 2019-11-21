const path = require('path');
//let {PythonShell} = require('python-shell');
//PythonShell.run('./assets/generateAssets.py',null,() => {});

module.exports = {
  entry: path.resolve(__dirname, 'src/index.ts'),
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  output: {
    path: path.resolve(__dirname, 'build' + '/' + process.env.PLATFORM),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.(frag|vert)$/i,
        use: {
          loader: 'raw-loader'
        }
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  }
}
