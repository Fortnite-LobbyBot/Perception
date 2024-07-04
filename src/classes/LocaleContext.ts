import type { Locales } from '@fnlb-project/shared/types';
import type { LocaleObject } from '../types/LocaleObject';
import type { LocaleOptions } from '../types/LocaleOptions';
import { LocaleTranslator } from './LocaleTranslator';

export class LocaleContext {
	public localeObject?: LocaleObject;
	public locale: Locales;

	public constructor(localeObject: LocaleObject | undefined, locale: Locales) {
		this.localeObject = localeObject;
		this.locale = locale;
	}

	public createTranslator(options: LocaleOptions) {
		return new LocaleTranslator(this.localeObject?.[options.module], this.locale, options);
	}
}
