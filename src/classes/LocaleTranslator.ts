import type { Locales } from '@fnlb-project/shared/types';
import type { ModuleObject } from '../types/LocaleObject';
import type { LocaleOptions } from '../types/LocaleOptions';

export class LocaleTranslator {
	private readonly moduleObject: ModuleObject | undefined;
	public locale: Locales;
	public options: LocaleOptions;

	public constructor(moduleObject: ModuleObject | undefined, locale: Locales, options: LocaleOptions) {
		this.moduleObject = moduleObject;
		this.locale = locale;
		this.options = options;
	}

	public translate(key: string, variables?: Record<string, string>) {
		if (!this.moduleObject) {
			const notLoadedError = `ERR_FNLB_TRANSLATOR_NOT_LOADED: LOCALE "${this.locale}" MODULE "${this.options.module}" NOT LOADED.`;

			console.error(notLoadedError);

			return notLoadedError;
		}

		const result = this.moduleObject[key];

		const notFoundError = `ERR_FNLB_TRANSLATION_NOT_FOUND: LOCALE "${this.locale}" MODULE "${this.options.module} KEY "${key}" NOT FOUND."`;

		if (!result) console.error(notFoundError);

		return (
			result?.replace(/{(.*?)}/gi, (_match, value) => {
				return variables?.[value] ?? '';
			}) ?? notFoundError
		);
	}
}
