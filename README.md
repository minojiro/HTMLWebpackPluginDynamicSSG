# HTMLWebpackPlugin を使って、シンプルにヘッドレス CMS のコンテンツを静的ビルドする試み

流行りの Gatsby や Nuxt.js などのモダンなフレームワークをベースに作る JAMStack は、メリットも多い反面、普段からウェブアプリケーションの開発に慣れたフロントエンドエンジニアでないと敷居が高いと思います。

そこで、 HTML を少し書けるぐらいのビギナーでも、コードを見た時になるべくストレスに感じない状態を保ちつつ、ヘッドレス CMS などと連携した静的サイトの生成が気軽にできる仕組みを作ってみました。
データの受け渡し部分だけ少し慣れた方が行えば、その他の見た目の部分はビギナーの方でも比較的ストレスなく実装できることを目標にしています。

バンドラーに Webpack と、 HTML の生成におなじみの HTMLWebpackPlugin を使って、お手軽にヘッドレス CMS と連携してみたいと思います。

## 前提

HTMLWebpackPlugin 単体では、ルーティングを動的に行うことはできません。

基本的に HTMLWebpackPlugin を使って複数ページを出力する時は、ページの数だけ plugins の中で `new HTMLWebpackPlugin()` を書いていきます。以下のような形です。

```js
module.exports = {
  entry: './hoge.js',
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      filename: '/index.html',
      template: 'template/home.ejs',
    }),
    new HtmlWebpackPlugin({
      filename: '/news/index.html',
      template: 'template/news/index.ejs',
    }),
    new HtmlWebpackPlugin({
      filename: '/news/hoge/index.html',
      template: 'template/news/show.ejs',
      templateParameters: {
        // ここで指定した文字列などをテンプレートの中で展開できる
        title: 'hoge',
        body: 'hogehoge',
      },
    }),
    new HtmlWebpackPlugin({
      filename: '/news/fuga/index.html',
      template: 'template/news/show.ejs',
      templateParameters: {
        title: 'fuga',
        body: 'fugafuga',
      },
    }),
    // ...
  ],
}
```

plugins の中に手で沢山書かなくてはいけない `new HtmlWebpackPlugin()` を、自動で生成してくれる仕組みを実装していきます。

## 実装した内容

### テンプレートを置いたディレクトリ構成に準じて、自動でルーティングさせる

Nuxt.js などを使う方にはおなじみかと思いますが、テンプレートのディレクトリ構造を、そのまま URL に反映してくれる仕組みがあると、ルーティングのためにわざわざページ以外の場所に記述する手間がなくて便利です。

 - `/templates/index.html` => `/index.html`
 - `/templates/about.html` => `/about/index.html`
 - `/templates/news/index.html` => `/news/index.html`

### APIから非同期でコンテンツを取得してからレンダーさせる

基本的には上の仕組みにより、テンプレートとページが 1 : 1 で書き出されますが、任意のテンプレートに動的な情報を渡せたり、記事のページなどを動的に増やしていきたいときに、ひとつのテンプレートから複数のページを書き出せる仕組みです。

```javascript
const getRoutes = async () => {
  const articles = await getArticlesFromAPI()
  const webpackAutoRouter = new WebpackAutoRouter({
    HTMLWebpackPlugin,
    templatesRoot: 'templates',
    actions: [
  
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
```

wip
