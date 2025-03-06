const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const TerserPlugin = require('terser-webpack-plugin')
// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const config = (env, argv) => {
  const isProd = argv.mode ==='production'

  return {
    mode: isProd ? 'production' : 'development',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'main.js'
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    // devServer: {
    //   static: path.resolve(__dirname, 'build'),
    //   compress: true,
    //   port: 3001,
    //   hot: true, // Enable hot module replacement
    //   historyApiFallback: true, // For React Router
    //   open: true, // Opens browser automatically
    //   proxy: [
    //     {
    //       context: ['/api'],
    //       target: 'http://localhost:3000',
    //       changeOrigin: true,
    //     }
    //   ],
    // },
    devtool: 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html'
      }),
      // Use only dotenv-webpack for environment variables
      new Dotenv({
        systemvars: true, // Load all system environment variables as well
      }),
      // new webpack.DefinePlugin({
      //   'process.env': {
      //     APP_API_URL: JSON.stringify(process.env.APP_API_URL || 'http://localhost:3000/api'),
      //   }
      // }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            globOptions: {
              ignore: ['**/index.html'] // Don't copy index.html as it's handled by HtmlWebpackPlugin
            }
          }
        ]
      })

    ],
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', {
                runtime: 'automatic'  // This enables the new JSX transform
              }]
            ]
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
  }
}

module.exports = config