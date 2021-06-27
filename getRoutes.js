const HTMLWebpackPlugin = require('html-webpack-plugin')
const { WebpackAutoRouter } = require('./lib/index.js')

const getArticlesFromAPI = async () => {
  // TODO: あとで実装
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          title: 'hoge',
          body: 'hoge hoge dayo--',
        },
        {
          title: 'fuga',
          body: 'fuga fuga dayo--',
        },
        {
          title: 'piyo',
          body: 'piyo piyo dayo--',
        },
      ])
    }, 500)
  })
}

const getRoutes = async () => {
  const articles = await getArticlesFromAPI()
  const webpackAutoRouter = new WebpackAutoRouter({
    HTMLWebpackPlugin,
    templatesRoot: 'templates',
    actions: [

      // NEWS index page
      {
        templateRegexp: /news\/index/,
        async handler() {
          return [
            {
              filename: `news/index.html`,
              templateParameters: { articles },
            },
          ]
        },
      },

      // NEWS detail page
      {
        templateRegexp: /news\/show/,
        async handler() {
          return articles.map(article => ({
            filename: `news/${article.title}/index.html`,
            templateParameters: { article },
          }))
        },
      },

    ],
  })
  return await webpackAutoRouter.exec()
}

module.exports = {
  getRoutes,
}
