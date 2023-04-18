import * as nx_monorepo from "@aws-prototyping-sdk/nx-monorepo";
import { buildExecutableCommand } from "aws-prototyping-sdk/nx-monorepo";
import {
  Component,
  DependencyType,
  javascript,
  LogLevel,
  Project,
  SourceCode,
  TextFile,
  typescript,
} from "projen";
import {
  type TypescriptConfigOptions,
  TypeScriptModuleResolution,
} from "projen/lib/javascript";
import { ModuleImports } from "projen/lib/javascript/render-options";
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
  projenCommand: buildExecutableCommand(
    javascript.NodePackageManager.PNPM,
    "projen"
  ),
  prettier: true,
  projenrcTs: true,
  renovatebot: true,
  gitignore: ["/.idea", ".idea"],
  workspaceConfig: {
    linkLocalWorkspaceBins: true,
  },
  logging: {
    level: LogLevel.DEBUG,
    usePrefix: true,
  },
  tsconfig: {
    compilerOptions: {
      rootDir: ".",
      module: "ESNext",
      target: "ES2022",
      lib: ["ES2022"],
      allowImportingTsExtensions: true,
      allowArbitraryExtensions: true,
      emitDeclarationOnly: true,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
      strict: true,
      strictNullChecks: true,
    },
  },
  projenVersion: "0.71.7",
  devDeps: [
    "aws-prototyping-sdk",
    "@aws-prototyping-sdk/nx-monorepo",
    "vite",
    "@vitejs/plugin-vue",
    "unbuild",
    "vitest",
    "rollup-plugin-vue",
    "tsx",
    "unbuild",
    "@types/prettier",
    "fs-extra",
    "@types/fs-extra",
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
  "@aws-prototyping-sdk/nx-monorepo@0.14.21":
    "patches/@aws-prototyping-sdk__nx-monorepo@0.14.21.patch",
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

  file: SourceCode;
  readonly imports: ModuleImports;

  constructor(project: Project, options: UnBuildOptions = {}) {
    super(project);
    this.vue = options.vue ?? false;
    this.options = options.options ?? {};

    this.file = new SourceCode(this.project, "build.config.ts", {
      readonly: true,
    });
    this.file.line(`// ${this.file.marker}`);

    this.project.deps.addDependency("unbuild", DependencyType.BUILD);
    this.imports = new ModuleImports();
    this.imports.add("unbuild", "defineBuildConfig");

    if (this.vue) {
      this.project.deps.addDependency(
        "rollup-plugin-vue",
        DependencyType.BUILD
      );
      this.file.line(`import vue from "rollup-plugin-vue";`);
    }

    this.imports.asEsmImports().map((imp) => this.file.line(imp));
    this.file.open(`export default defineBuildConfig({`);

    const optionsSource = Object.keys(this.options).length
      ? "..." + JSON.stringify(this.options) + ","
      : "";
    const hooksSource = this.options?.hooks
      ? "..." + JSON.stringify(this.options.hooks) + ","
      : "";

    this.file.line(optionsSource);
    this.file.open("hooks: {");
    if (this.vue) {
      this.file.open(`'rollup:options': (ctx, options) => {`);
      this.file.line("// @ts-expect-error ignore rollup");
      this.file.line("options.plugins.push(vue());");
      this.file.close("},");
    }
    this.file.line(hooksSource);
    this.file.close("}");
    this.file.close("})");
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
      libdir: 'dist',
      entrypoint: 'dist/index.mjs',
      entrypointTypes: 'dist/index.d.ts',
      ...options,
    });

    new UnBuild(this, { vue: true, options: { name: defaultPackageName, declaration: true  } });
    new TextFile(this, "env.d.ts", {
      readonly: true,
      marker: true,
      lines: `declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}`.split("\n"),
    });

    this.addDeps("vue", "@vue/runtime-dom");
    this.addDevDeps("typescript", "vitest");

    this.deps.addDependency("eslint-plugin-vue", DependencyType.DEVENV);
    this.eslint!.addPlugins("eslint-plugin-vue");
    this.eslint!.config.parserOptions.extraFileExtensions = [".vue"];
    this.eslint!.ignorePatterns.push("build.config.ts");

    this.tsconfig!.addInclude("env.d.ts");
    this.tsconfig!.addInclude("src/**/*.vue");
    this.tsconfigDev!.addExclude("build.config.ts");
    this.tsconfigDev!.addInclude("src/**/*.vue");
    this.tasks.removeTask("build");
    this.tasks.addTask("build", { exec: "unbuild" });
  }
}

const text = new VueComponentProject({
  parent: monorepo,
  name: "vue.ui.text",
});

const button = new VueComponentProject({
  parent: monorepo,
  name: "vue.ui.button",
  deps: ["primevue", text.package.packageName],
});

monorepo.synth();
