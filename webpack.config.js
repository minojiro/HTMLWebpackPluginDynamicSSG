const { getRoutes } = require('./getRoutes')

module.exports = async () => {
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
            'ejs-compiled-loader',
          ],
        },
      ],
    },
    plugins: [
      ...(await getRoutes()),
    ],
  }
}
