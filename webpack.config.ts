import { resolve } from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  entry: { helloFunction1: './src/handlers/hello-function-1.ts', helloFunction2: './src/handlers/hello-function-2.ts' },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: resolve(__dirname, 'build'),
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  target: 'node',
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  optimization: {
    minimize: false
  }
};

export default config;