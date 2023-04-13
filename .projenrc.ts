import { nx_monorepo } from "aws-prototyping-sdk";
import { javascript, typescript } from "projen";
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
  gitignore: ["/.idea"],
  devDeps: [
    "aws-prototyping-sdk",
    "vite",
    "@vitejs/plugin-vue",
    "unbuild",
    "vitest",
    "rollup-plugin-vue",
  ],
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});

const vueTsConfig: TypescriptConfigOptions = {
  compilerOptions: {
    skipLibCheck: true,
    moduleResolution: TypeScriptModuleResolution.NODE,
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

j    this.addDeps("vue", "@vue/runtime-dom");
    this.addDevDeps("typescript", "vitest", "unbuild", "rollup-plugin-vue");

    this.tsconfig!.file.addOverride(
      "compilerOptions.moduleResolution",
      "bundler"
    );
    this.tsconfig!.file.addOverride(
      "compilerOptions.allowImportingTsExtensions",
      true
    );
    this.tsconfig!.file.addOverride(
      "compilerOptions.allowArbitraryExtensions",
      true
    );
    this.tsconfig!.file.addOverride(
      "compilerOptions.verbatimModuleSyntax",
      true
    );

    this.tsconfig!.addInclude("../../../../env.d.ts");
    this.tsconfig!.addInclude("src/**/*.vue");
    this.tasks.removeTask("build");
    this.tasks.addTask("build", { exec: "unbuild" });
  }
}

new VueComponentProject({
  parent: monorepo,
  name: "vue.ui.text"
});

monorepo.synth();
