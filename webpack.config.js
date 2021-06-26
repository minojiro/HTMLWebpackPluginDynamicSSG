const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = () => {
  return {
    entry: './index.js',
    devServer: {
      contentBase: './dist',
    },
    module: {
      rules : [
        {
          test : /\.ejs$/,
          use  : [
            'html-loader',
            'ejs-html-loader',
          ],
        },
      ],
    },
    plugins: [
      new HTMLWebpackPlugin({
        filename: 'index.html',
        template: './templates/index.ejs',
      }),
      new HTMLWebpackPlugin({
        filename: 'news/index.html',
        template: './templates/news/index.ejs',
      }),
      new HTMLWebpackPlugin({
        filename: 'news/show/index.html',
        template: './templates/news/show.ejs',
      }),
    ],
  }
}
