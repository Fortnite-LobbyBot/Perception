import type { Locales } from '../types/enums/Locales';
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
		const result = this.moduleObject?.[key];

		return (
			result?.replace(/{(.*?)}/gi, (_match, value) => {
				return variables?.[value] ?? '';
			}) ?? `TRANSLATION_ERROR: LOCALE "${this.locale}" KEY "${key}" MODULE "${this.options.module}"`
		);
	}
}
