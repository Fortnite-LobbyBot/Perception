import type { Locales } from './enums/Locales';

export interface TranslatorSettings {
	langPaths: string[];
	rootLangFiles: string[];
	rootLangCode: Locales;
	outputLangs: Locales[];
	translateDelay: number;
	debug: boolean;
}
