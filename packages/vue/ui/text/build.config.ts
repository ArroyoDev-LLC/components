import { defineBuildConfig } from 'unbuild'
import vue from 'rollup-plugin-vue'
export default defineBuildConfig({
      ...{}
    hooks: {
      'rollup:options': (ctx, options) => {
        // @ts-expect-error ignore
        options.plugins.push(vue());
      },
    },
      });