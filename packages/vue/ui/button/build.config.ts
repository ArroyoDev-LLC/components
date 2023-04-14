import { defineBuildConfig } from 'unbuild'
import vue from 'rollup-plugin-vue'
export default defineBuildConfig({
      
    failOnWarn: false,
    hooks: {
      'rollup:options': (ctx, options) => {
        // @ts-expect-error ignore
        options.plugins.push(vue());
      },
    },
      });