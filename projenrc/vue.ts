import { DependencyType, javascript, TextFile, typescript } from 'projen'
import {
	TypescriptConfigOptions,
	TypeScriptModuleResolution,
} from 'projen/lib/javascript'
import { TypeScriptProjectOptions } from 'projen/lib/typescript'
import LintConfig from './lint-config.ts'
import { UnBuild } from './unbuild.ts'

const vueTsConfig: TypescriptConfigOptions = {
	compilerOptions: {
		skipLibCheck: true,
		moduleResolution: TypeScriptModuleResolution.BUNDLER,
		allowImportingTsExtensions: true,
		allowArbitraryExtensions: true,
		verbatimModuleSyntax: true,
		module: 'ESNext',
		target: 'ESNext',
		lib: ['ESNext', 'DOM'],
	},
}

interface VueComponentProjectOptions
	extends Omit<TypeScriptProjectOptions, 'defaultReleaseBranch'> {
	defaultReleaseBranch?: string
}

export class VueComponentProject extends typescript.TypeScriptProject {
	constructor(options: VueComponentProjectOptions) {
		const { name } = options
		const namePath = name.split('.').join('/')
		const defaultOutDir = `packages/${namePath}`
		const defaultPackageName = `@arroyodev-llc/components.${name}`
		super({
			defaultReleaseBranch: 'main',
			tsconfig: vueTsConfig,
			packageManager: javascript.NodePackageManager.PNPM,
			pnpmVersion: '8',
			outdir: defaultOutDir,
			packageName: defaultPackageName,
			jest: false,
			projenDevDependency: false,
			libdir: 'dist',
			entrypoint: 'dist/index.mjs',
			entrypointTypes: 'dist/index.d.ts',
			...options,
		})

		new LintConfig(this, { vue: true })

		new UnBuild(this, {
			vue: true,
			options: { name: defaultPackageName, declaration: true },
		})
		new TextFile(this, 'env.d.ts', {
			readonly: true,
			marker: true,
			lines: `declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}`.split('\n'),
		})

		this.addDeps('vue', '@vue/runtime-dom')
		this.addDevDeps('typescript', 'vitest')

		this.deps.addDependency('eslint-plugin-vue', DependencyType.DEVENV)
		this.eslint!.addPlugins('eslint-plugin-vue')
		this.eslint!.config.parserOptions.extraFileExtensions = ['.vue']
		this.tsconfig!.addInclude('env.d.ts')
		this.tsconfig!.addInclude('src/**/*.vue')
		this.tsconfigDev!.addInclude('src/**/*.vue')
		this.tasks.removeTask('build')
		this.tasks.addTask('build', { exec: 'unbuild' })
	}
}
