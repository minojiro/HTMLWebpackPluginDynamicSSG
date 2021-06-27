import type HTMLWebpackPluginType from 'html-webpack-plugin'
import type {Options as HTMLWebpackPluginOptions} from 'html-webpack-plugin'
import fg from 'fast-glob'

const INDEX_REGEXP = /index\.(ejs|pug|html?)$/
const TEMPLATES_REGEXP = /([^\/]+)\.(ejs|pug|html?)$/

export type Action = {
  templateRegexp: RegExp
  handler: () => Promise<HTMLWebpackPluginOptions[]>
}

export type Options = {
  HTMLWebpackPlugin: typeof HTMLWebpackPluginType
  templatesRoot: string
  actions?: Action[]
}

export class WebpackAutoRouter {
  actions: Action[]
  options: Omit<Options, 'actions'>

  constructor(options: Options) {
    this.actions = options.actions || []
    this.options = options
  }

  get TEMPLATE_DIR_REGEXP() {
    return new RegExp(`^${this.options.templatesRoot}`, 'i')
  }

  async generateHTMLPluginInstances(template: string) {
    const INDEX_HTML = 'index.html'
    let actionPages = (
      await Promise.all(
        this.actions
          .filter(action => action.templateRegexp.test(template))
          .map(async action => {
            const pluginOptions = await action.handler()
            return pluginOptions.map(pluginOption => (
              new this.options.HTMLWebpackPlugin({
                ...pluginOption,
                template,
              })
            ))
          })
      )
    ).flat()

    if (actionPages.length === 0) {
      let filename = template.replace(this.TEMPLATE_DIR_REGEXP, '')
      if (INDEX_REGEXP.test(filename)) {
        filename = filename.replace(INDEX_REGEXP, INDEX_HTML)
      } else {
        filename = filename.replace(TEMPLATES_REGEXP, `$1/${INDEX_HTML}`)
      }
      filename = filename.replace(/^\//, '')
      actionPages.push(
        new this.options.HTMLWebpackPlugin({
          filename,
          template,
        })
      )
    }
    return actionPages
  }

  public async exec(): Promise<InstanceType<typeof HTMLWebpackPluginType>[]> {
    const search = `${this.options.templatesRoot}/**/[^_]*.(ejs|pug|html?)`
    const templates = await fg([search])
    return (
      await Promise.all(
        templates.flatMap(async (t) => await this.generateHTMLPluginInstances(t))
      )
    ).flat()
  }
}
