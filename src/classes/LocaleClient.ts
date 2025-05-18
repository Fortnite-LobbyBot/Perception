import { Locales } from '@fnlb-project/shared/types';
import { PromiseUtil } from '@fnlb-project/shared/util';
import type { LocaleObject } from '../types/LocaleObject';
import { AsyncLock } from './AsyncLock';
import { LocaleContext } from './LocaleContext';

const CDN_URL = 'https://cdn.fnlb.net';

export class LocaleClient {
	private readonly scope: string;
	private contextCache: Record<string, LocaleContext> = {};
	private loadCache: Record<string, AsyncLock> = {};

	public constructor(scope: string) {
		this.scope = scope;
	}

	public async getContext(route: string, locale: Locales, maxRetries = Infinity, retryTimeout = 10000) {
		const fullRoute = `${route}/${locale}.json`;

		const cachedContext = this.contextCache[fullRoute];
		if (cachedContext) return cachedContext;

		const cachedLoad = this.loadCache[fullRoute];

		if (!cachedLoad) {
			const lock = new AsyncLock();
			lock.lock();
			this.loadCache[fullRoute] = lock;

			let attempts = 0;
			let localeObject: LocaleObject | null = null;

			while (attempts < maxRetries) {
				try {
					const response = await fetch(`${CDN_URL}/locales/${this.scope}/${fullRoute}`);
					localeObject = await response.json().catch(() => null);
					if (localeObject) break;
				} catch {
					await PromiseUtil.wait(retryTimeout);
					console.warn(
						`Failed to fetch locale object for scope "${this.scope}" route "${route}" locale "${locale}". Retrying in ${retryTimeout} Attempt ${attempts + 1}/${maxRetries}`
					);
				}
				attempts++;
			}

			lock.unlock();

			if (!localeObject) {
				console.warn(
					`Failed to fetch locale object for scope "${this.scope}" route "${route}" locale "${locale}". Retrying in ${retryTimeout} Attempt ${attempts + 1}/${maxRetries}`
				);

				return undefined;
			}

			const ctx = new LocaleContext(localeObject, locale);
			this.contextCache[fullRoute] = ctx;
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
