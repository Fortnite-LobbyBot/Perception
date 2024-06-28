import { Locales, type LocalesString } from '../types/enums/Locales';
import { LocaleContext } from './LocaleContext';

export class LocaleClient {
	public scope: string;
	protected contextCache: Record<string, LocaleContext> = {};

	public constructor(scope: string) {
		this.scope = scope
	}

	public getContext(route: string) {
		const cachedContext = this.contextCache[route]

		if (cachedContext) return cachedContext;

		const ctx = new LocaleContext(this, route);

		this.contextCache[route] = ctx

		return ctx
	}

	static transformToSupportedLocale(locale: any): LocalesString {
		if (typeof locale !== 'string') return Locales.Default;

		if (Object.values(Locales).includes(locale as Locales)) return locale as Locales;

		return Locales.Default;
	}
}
