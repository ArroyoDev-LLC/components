// ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".
import vue from "rollup-plugin-vue";
import { defineBuildConfig } from "unbuild";
export default defineBuildConfig({
  ...{"name":"@arroyodev-llc/components.vue.ui.text","declaration":true},
  hooks: {
    'rollup:options': (ctx, options) => {
      // @ts-expect-error ignore rollup
      options.plugins.push(vue());
    },

  }
})