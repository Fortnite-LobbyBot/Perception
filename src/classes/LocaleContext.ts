import type { LocaleObject } from '../types/LocaleObject';
import type { LocaleOptions } from '../types/LocaleOptions';
import { LocaleTranslator } from './LocaleTranslator';

export class LocaleContext {
	public localeObject?: LocaleObject;

	public constructor(localeObject?: LocaleObject) {
		this.localeObject = localeObject;
	}

	public createTranslator(options: LocaleOptions) {
		return new LocaleTranslator(this.localeObject?.[options.module], options);
	}
}
