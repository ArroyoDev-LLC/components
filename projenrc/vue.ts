import { LintConfig } from "@arroyodev-llc/projen.component.linting";
import { UnBuild } from "@arroyodev-llc/projen.component.unbuild";
import { Vitest, VitestConfigType } from "@arroyodev-llc/projen.component.vitest";
import { javascript, typescript } from "projen";
import { type TypescriptConfigOptions, TypeScriptModuleResolution } from "projen/lib/javascript";
import { type TypeScriptProjectOptions } from "projen/lib/typescript";
import { Vue } from "../packages/projen/component/vue/src";

const vueTsConfig: TypescriptConfigOptions = {
	compilerOptions: {
		skipLibCheck: true,
		moduleResolution: TypeScriptModuleResolution.BUNDLER,
		emitDeclarationOnly: true,
		allowImportingTsExtensions: true,
		allowArbitraryExtensions: true,
		verbatimModuleSyntax: true,
		module: 'ESNext',
		target: 'ESNext',
		lib: ['ESNext', 'DOM'],
	},
}

interface VueComponentOptions
	extends Omit<TypeScriptProjectOptions, 'defaultReleaseBranch'> {
	defaultReleaseBranch?: string
}

export class VueComponent extends typescript.TypeScriptProject {
	constructor(options: VueComponentOptions) {
		const { name } = options
		const namePath = name.split('.').join('/')
		const defaultOutDir = `packages/${namePath}`
		const defaultPackageName = `@arroyodev-llc/components.${name}`
		super({
			defaultReleaseBranch: 'main',
			packageManager: javascript.NodePackageManager.PNPM,
			pnpmVersion: '8',
			outdir: defaultOutDir,
			packageName: defaultPackageName,
			jest: false,
			projenDevDependency: false,
			libdir: 'dist',
			entrypoint: 'dist/index.mjs',
			entrypointTypes: 'dist/index.d.ts',
			typescriptVersion: '^5',
			...options,
		})
		new LintConfig(this)
		new UnBuild(this, {
			options: { name: defaultPackageName, declaration: true },
		})
		new Vitest(this, {
			configType: VitestConfigType.PROJECT,
			settings: {
				test: {
					name: this.name,
					environment: 'happy-dom',
					include: [`${this.testdir}/\*\*/\*.spec.ts`],
				},
			},
		})

		this.tasks.tryFind('compile')!.reset('unbuild')
		this.tasks
			.tryFind('test')!
			.reset('vitest', { args: ['--run'], receiveArgs: true })

		new Vue(this)
	}
}
