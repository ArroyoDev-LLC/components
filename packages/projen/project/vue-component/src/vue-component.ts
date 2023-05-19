import { Vue } from '@arroyodev-llc/projen.component.vue'
import {
	TypescriptProject,
	type TypeScriptProjectOptions,
} from '@arroyodev-llc/projen.project.typescript'

export class VueComponentProject extends TypescriptProject {
	public readonly vue: Vue

	constructor(options: TypeScriptProjectOptions) {
		super({
			release: true,
			...options,
		})
		this.vue = new Vue(this)
	}

	protected applyPackage(): this {
		super.applyPackage()
		this.package.addField('sideEffects', true)
		return this
	}
}
