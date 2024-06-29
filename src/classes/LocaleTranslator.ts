import type { ModuleObject } from '../types/LocaleObject';
import type { LocaleOptions } from '../types/LocaleOptions';

export class LocaleTranslator {
	private moduleObject: ModuleObject | undefined;
	options: LocaleOptions;

	public constructor(moduleObject: ModuleObject | undefined, options: LocaleOptions) {
		this.moduleObject = moduleObject;
		this.options = options;
	}

	public translate(key: string, variables?: Record<string, string>) {
		const result = this.moduleObject?.[key];

		return (
			result?.replace(/{(.*?)}/gi, (_match, value) => {
				return variables?.[value] ?? '';
			}) ?? `TRANSLATION_ERROR: KEY "${key}" MODULE "${this.options.module}"`
		);
	}
}
