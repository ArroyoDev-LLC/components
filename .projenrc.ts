import { nx_monorepo } from "aws-prototyping-sdk";
import { javascript, typescript } from "projen";
import { TypeScriptModuleResolution } from "projen/lib/javascript";

const monorepo = new nx_monorepo.NxMonorepoProject({
  authorEmail: "support@arroyodev.com",
  authorName: "arroyoDev",
  authorOrganization: true,
  authorUrl: "https://arroyodev.com",
  defaultReleaseBranch: "main",
  devContainer: true,
  devDeps: ["aws-prototyping-sdk"],
  docgen: true,
  name: "components",
  packageManager: javascript.NodePackageManager.PNPM,
  pnpmVersion: "8",
  prettier: true,
  projenrcTs: true,
  renovatebot: true,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});

new typescript.TypeScriptProject({
  parent: monorepo,
  outdir: "packages/vue/ui/text",
  name: "vue.ui.text",
  defaultReleaseBranch: "main",
  packageName: "@arroyodev-llc/components.vue.ui.text",
  packageManager: javascript.NodePackageManager.PNPM,
  pnpmVersion: "8",
  deps: ["vue"],
  tsconfig: {
    compilerOptions: {
      skipLibCheck: true,
      moduleResolution: TypeScriptModuleResolution.NODE,
      module: "ESNext",
      target: "ESNext",
      lib: ["ESNext", "DOM"],
    },
  },
});

monorepo.synth();
