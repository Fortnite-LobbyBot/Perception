export enum Locales {
	Default = 'en',
	De = 'de',
	Es = 'es',
	Fr = 'fr',
	It = 'it',
	Pl = 'pl',
	Pt = 'pt',
	Tr = 'tr'
}

export type LocalesString = `${Locales}`;

export class LocaleClient {
	localeObject: Record<string, string>;
	localeString: LocalesString;
	defaultLocaleString: LocalesString;
	removeDash: boolean;

	constructor({
		locale,
		localeRoute,
		localeModule,
		removeDash = false
	}: {
		locale?: LocalesString;
		localeRoute: string;
		localeModule: string;
		removeDash?: boolean;
	}) {
		this.removeDash = removeDash;
		this.defaultLocaleString = this.removeDash
			? (Locales.Default.split('-')[0] as LocalesString)
			: Locales.Default;
		this.localeString = this.removeDash
			? ((locale || this.defaultLocaleString).split(
					'-'
				)[0] as LocalesString)
			: locale || this.defaultLocaleString;

		let requiredLocale;

		try {
			requiredLocale = require(
				`../src/locales/${localeRoute}/${locale}.json`
			);
		} catch {
			requiredLocale = require(
				`../src/locales/${localeRoute}/${this.defaultLocaleString}.json`
			);

			this.localeString = this.defaultLocaleString;
		}

		this.localeObject = requiredLocale[localeModule];
	}

	translate(key: string, variables?: Record<string, string>) {
		const result = this.localeObject[key];

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
