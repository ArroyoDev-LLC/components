import vue from 'rollup-plugin-vue';
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  hooks: {
    'rollup:options': (ctx, options) => {
      // @ts-expect-error ignore
      options.plugins.push(vue());
    },
  },
});
