import type { Locales } from '@fnlb-project/shared/types';

export interface TranslatorSettings {
	langPaths: string[];
	rootLangFiles: string[];
	rootLangCode: Locales;
	outputLangs: Locales[];
	translateDelay: number;
	debug: boolean;
}
