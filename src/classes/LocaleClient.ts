import { Locales } from '@fnlb-project/shared/types';
import type { LocaleObject } from '../types/LocaleObject';
import { AsyncLock } from './AsyncLock';
import { LocaleContext } from './LocaleContext';

const CDN_URL = 'https://cdn.fnlb.net';

export class LocaleClient {
	private scope: string;
	private contextCache: Record<string, LocaleContext> = {};
	private loadCache: Record<string, AsyncLock> = {};

	public constructor(scope: string) {
		this.scope = scope;
	}

	public async getContext(route: string, locale: Locales) {
		const fullRoute = `${route}/${locale}.json`;

		const cachedContext = this.contextCache[fullRoute];

		if (cachedContext) return cachedContext;

		const cachedLoad = this.loadCache[fullRoute];

		if (!cachedLoad) {
			const lock = new AsyncLock();

			lock.lock();

			this.loadCache[fullRoute] = lock;

			const localeObject = (await fetch(`${CDN_URL}/locales/${this.scope}/${fullRoute}`)
				.then((res) => res.json().catch(() => null))
				.catch(() => null)) as LocaleObject | null;

			if (!localeObject) return undefined;

			const ctx = new LocaleContext(localeObject, locale);

			this.contextCache[fullRoute] = ctx;

			lock.unlock();

			return ctx;
		}

		if (cachedLoad?.isLocked) await cachedLoad.wait();

		return this.contextCache[fullRoute];
	}

	static transformToSupportedLocale(locale: any): Locales {
		if (typeof locale !== 'string') return Locales.Default;

		const transformedLocale = locale.split('-')[0]?.toLowerCase()!;

		if (Object.values(Locales).includes(transformedLocale as Locales)) return transformedLocale as Locales;

		return Locales.Default;
	}
}
