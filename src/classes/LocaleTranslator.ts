import type { Locales } from '@fnlb-project/shared/types';
import type { ModuleObject } from '../types/LocaleObject';
import type { LocaleOptions } from '../types/LocaleOptions';

export class LocaleTranslator {
	private moduleObject: ModuleObject | undefined;
	public locale: Locales;
	public options: LocaleOptions;

	public constructor(moduleObject: ModuleObject | undefined, locale: Locales, options: LocaleOptions) {
		this.moduleObject = moduleObject;
		this.locale = locale;
		this.options = options;
	}

	public translate(key: string, variables?: Record<string, string>) {
		if (!this.moduleObject) {
			console.error(`TRANSLATOR_ERROR: LOCALE "${this.locale}" MODULE "${this.options.module}" NOT LOADED.`);

			return `TRANSLATOR_ERROR: LOCALE "${this.locale}" MODULE "${this.options.module}" NOT LOADED. KEY: "${key}"`;
		}

		const result = this.moduleObject[key];

		if (!result)
			console.error(`TRANSLATION_ERROR: LOCALE "${this.locale}" KEY "${key}" MODULE "${this.options.module}"`);

		return (
			result?.replace(/{(.*?)}/gi, (_match, value) => {
				return variables?.[value] ?? '';
			}) ?? `TRANSLATION_ERROR: LOCALE "${this.locale}" KEY "${key}" MODULE "${this.options.module}"`
		);
	}
}
