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
  devDeps: ["aws-prototyping-sdk"],
  docgen: true,
  name: "components",
  packageManager: javascript.NodePackageManager.PNPM,
  pnpmVersion: "8",
  prettier: true,
  projenrcTs: true,
  renovatebot: true,
  gitignore: [".idea/**"],

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

    this.addDeps("vue", "@vue/runtime-dom");

    this.addDevDeps("typescript", "vitest");
  }
}

new VueComponentProject({
  parent: monorepo,
  name: "vue.ui.text",
});

monorepo.synth();
