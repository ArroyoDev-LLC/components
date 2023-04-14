import { nx_monorepo } from "aws-prototyping-sdk";
import {
  Component,
  DependencyType,
  javascript,
  Project,
  TextFile,
  typescript,
} from "projen";
import {
  type TypescriptConfigOptions,
  TypeScriptModuleResolution,
} from "projen/lib/javascript";
import { TypeScriptProjectOptions } from "projen/lib/typescript";
import type { BuildConfig as UnBuildBuildConfig } from "unbuild";

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
    "unbuild",
  ],
});
monorepo.gitignore.exclude(".idea", ".idea/**");
monorepo.defaultTask.reset("tsx .projenrc.ts");
monorepo.tsconfig.addInclude("**/*.ts");
monorepo.tsconfigDev.addInclude("**/*.ts");
monorepo.tsconfigDev.file.addOverride("compilerOptions.rootDir", ".");
monorepo.package.addField("type", "module");
monorepo.package.file.addOverride("pnpm.patchedDependencies", {
  "projen@0.71.7": "patches/projen@0.71.7.patch",
  "aws-prototyping-sdk@0.14.21": "patches/aws-prototyping-sdk@0.14.21.patch",
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

interface UnBuildOptions {
  vue?: boolean;
  options?: UnBuildBuildConfig;
}

class UnBuild extends Component {
  public static of(project: Project): UnBuild | undefined {
    const isUnBuild = (o: Component): o is UnBuild => o instanceof UnBuild;
    return project.components.find(isUnBuild);
  }

  readonly vue: boolean;
  readonly options: UnBuildBuildConfig;
  readonly file: TextFile;

  constructor(project: Project, options: UnBuildOptions = {}) {
    super(project);
    this.vue = options.vue ?? false;
    this.options = options.options ?? {};

    this.project.deps.addDependency("unbuild", DependencyType.BUILD);
    this.project.deps.addDependency("rollup-plugin-vue", DependencyType.BUILD);
    this.file = new TextFile(this.project, "build.config.ts", {
      lines: [
        `import { defineBuildConfig } from 'unbuild'`,
        ...(this.vue && [`import vue from 'rollup-plugin-vue'`]),
        `export default defineBuildConfig(${this.buildConfig}});`,
      ],
    });
  }

  get buildConfig(): string {
    const config = Object.keys(this.options).length
      ? `...${JSON.stringify(this.options)},`
      : ``;
    if (this.vue) {
      return `{
      ${config}
    hooks: {
      'rollup:options': (ctx, options) => {
        // @ts-expect-error ignore
        options.plugins.push(vue());
      },
    },
      `;
    }
    return `{ ${JSON.stringify(this.options)} }`;
  }
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

    new UnBuild(this, { vue: true });

    this.addDeps("vue", "@vue/runtime-dom");
    this.addDevDeps("typescript", "vitest");

    this.deps.addDependency("eslint-plugin-vue", DependencyType.DEVENV);
    this.eslint!.addPlugins("eslint-plugin-vue");
    this.eslint!.config.parserOptions.extraFileExtensions = [".vue"];

    this.tsconfig!.addInclude("../../../../env.d.ts");
    this.tsconfig!.addInclude("src/**/*.vue");
    this.tsconfigDev!.addInclude("build.config.ts");
    this.tasks.removeTask("build");
    this.tasks.addTask("build", { exec: "unbuild" });
  }
}

new VueComponentProject({
  parent: monorepo,
  name: "vue.ui.text",
});

monorepo.synth();
