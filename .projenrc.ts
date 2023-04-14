import { nx_monorepo } from "aws-prototyping-sdk";
import { DependencyType, javascript, typescript } from "projen";
import {
  type TypescriptConfigOptions,
  TypeScriptModuleResolution,
} from "projen/lib/javascript";
import { TypeScriptProjectOptions } from "projen/lib/typescript";

const monorepo = new nx_monorepo.NxMonorepoProject({
  authorEmail: "support@arroyodev.com",
  authorName: "arroyoDev",
  authorOrganization: true,
  authorUrl: "https://arroyodev.com",
  defaultReleaseBranch: "main",
  devContainer: true,
  docgen: true,
  name: "components",
  packageManager: javascript.NodePackageManager.PNPM,
  pnpmVersion: "8",
  github: false,
  projenCommand: "pnpm exec projen",
  prettier: true,
  projenrcTs: true,
  renovatebot: true,
  gitignore: ["/.idea", ".idea"],
  tsconfig: {
    compilerOptions: {
      rootDir: ".",
      module: "ESNext",
      target: "ES2022",
      lib: ["ES2022"],
      allowImportingTsExtensions: true,
      allowArbitraryExtensions: true,
    },
  },
  devDeps: [
    "aws-prototyping-sdk",
    "vite",
    "@vitejs/plugin-vue",
    "unbuild",
    "vitest",
    "rollup-plugin-vue",
    "tsx",
  ],
});
monorepo.gitignore.exclude(".idea", ".idea/**")
monorepo.defaultTask.reset("tsx .projenrc.ts");
monorepo.tsconfig.addInclude("**/*.ts");
monorepo.tsconfigDev.addInclude("**/*.ts");
monorepo.tsconfigDev.file.addOverride("compilerOptions.rootDir", ".");
monorepo.package.addField("type", "module");
monorepo.package.file.addOverride("pnpm.patchedDependencies", {
  "projen@0.71.7": "patches/projen@0.71.7.patch",
});

const vueTsConfig: TypescriptConfigOptions = {
  compilerOptions: {
    skipLibCheck: true,
    moduleResolution: TypeScriptModuleResolution.BUNDLER,
    allowImportingTsExtensions: true,
    allowArbitraryExtensions: true,
    verbatimModuleSyntax: true,
    module: "ESNext",
    target: "ESNext",
    lib: ["ESNext", "DOM"],
  },
};

interface VueComponentProjectOptions
  extends Omit<TypeScriptProjectOptions, "defaultReleaseBranch"> {
  defaultReleaseBranch?: string;
}

class VueComponentProject extends typescript.TypeScriptProject {
  constructor(options: VueComponentProjectOptions) {
    const { name } = options;
    const namePath = name.split(".").join("/");
    const defaultOutDir = `packages/${namePath}`;
    const defaultPackageName = `@arroyodev-llc/components.${name}`;
    super({
      defaultReleaseBranch: "main",
      tsconfig: vueTsConfig,
      packageManager: javascript.NodePackageManager.PNPM,
      pnpmVersion: "8",
      outdir: defaultOutDir,
      packageName: defaultPackageName,
      jest: false,
      ...options,
    });

    this.addDeps("vue", "@vue/runtime-dom");
    this.addDevDeps("typescript", "vitest", "unbuild", "rollup-plugin-vue");

    this.deps.addDependency("eslint-plugin-vue", DependencyType.DEVENV);
    this.eslint!.addPlugins("eslint-plugin-vue");
    this.eslint!.config.parserOptions.extraFileExtensions = [".vue"];

    this.tsconfig!.addInclude("../../../../env.d.ts");
    this.tsconfig!.addInclude("src/**/*.vue");
    this.tasks.removeTask("build");
    this.tasks.addTask("build", { exec: "unbuild" });
  }
}

new VueComponentProject({
  parent: monorepo,
  name: "vue.ui.text",
});

monorepo.synth();
