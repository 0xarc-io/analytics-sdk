import path from 'path'

module.exports = {
  entry: {
    bundle: './src/index.ts',
    'bundle.min': './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.umd.min.js',
    libraryTarget: 'umd',
    library: 'ArcxAnalyticsSdk',
    libraryExport: 'ArcxAnalyticsSdk',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  devtool: 'source-map',
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
}
