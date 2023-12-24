export enum Locales {
	Default = 'en',
	Es = 'es',
	De = 'de',
	Fr = 'fr',
	It = 'it',
	Pt = 'pt',
}

export type LocalesString = `${Locales}`;

export class LocaleClient {
	locale: Record<string, string>;
	localeString: LocalesString;
	defaultLocaleString: LocalesString;

	constructor({
		locale,
		localeRoute,
		localeModule,
	}: {
		locale?: LocalesString;
		localeRoute: string;
		localeModule: string;
	}) {
		this.defaultLocaleString = Locales.Default;
		this.localeString = locale || this.defaultLocaleString;

		let requiredLocale;

		try {
			requiredLocale = require(
				`../locales/${localeRoute}/${locale}.json`,
			);
		} catch {
			requiredLocale = require(
				`../locales/${localeRoute}/${this.defaultLocaleString}.json`,
			);
			this.localeString = this.defaultLocaleString;
		}

		this.locale = requiredLocale[localeModule];
	}

	translate(key: string, variables?: Record<string, string>) {
		const result = this.locale[key];

		return result.replace(/{(.*?)}/gi, (_match, value) => {
			return variables?.[value] ?? '';
		});
	}

	numberToLocaleString(number: number): string {
		return number.toLocaleString(this.localeString);
	}

	static transformToSupportedLocale(locale: any): LocalesString {
		if (typeof locale !== 'string') return Locales.Default;

		if (Object.values(Locales).includes(locale as Locales))
			return locale as Locales;

		return Locales.Default;
	}
}
