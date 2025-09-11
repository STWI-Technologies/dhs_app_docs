const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'static/js/[name].[contenthash].js' : 'static/js/[name].js',
      chunkFilename: isProduction ? 'static/js/[name].[contenthash].chunk.js' : 'static/js/[name].chunk.js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/media/[name].[hash][ext]',
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        inject: true,
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash].css',
          chunkFilename: 'static/css/[name].[contenthash].chunk.css',
        }),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'public/staticwebapp.config.json',
              to: 'staticwebapp.config.json',
            },
          ],
        }),
      ] : []),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: {
        disableDotRule: true,
        rewrites: [
          { from: /^\/en\/.*\.html$/, to: function(context) {
            return context.parsedUrl.pathname;
          }},
          { from: /^\/es\/.*\.html$/, to: function(context) {
            return context.parsedUrl.pathname;
          }},
          { from: /./, to: '/index.html' }
        ]
      },
      setupMiddlewares: (middlewares, devServer) => {
        // Serve static HTML files directly
        devServer.app.use('/en', require('express').static(path.join(__dirname, 'public/en')));
        devServer.app.use('/es', require('express').static(path.join(__dirname, 'public/es')));
        devServer.app.use('/brand', require('express').static(path.join(__dirname, 'public/brand')));
        devServer.app.use('/data', require('express').static(path.join(__dirname, 'public/data')));
        devServer.app.use('/js', require('express').static(path.join(__dirname, 'public/js')));
        devServer.app.use('/images', require('express').static(path.join(__dirname, 'public/images')));
        
        return middlewares;
      },
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  };
};