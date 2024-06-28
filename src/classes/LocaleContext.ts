import ky from 'ky';
import type { LocaleClient } from './LocaleClient';
import type { LocaleObject } from '../types/LocaleObject';
import { LocaleTranslator } from './LocaleTranslator';
import { AsyncLock } from './AsyncLock';

const CDN_URL = 'https://cdn.fnlb.net';

export class LocaleContext {
    private localeClient: LocaleClient;
    private route: string;

    public localeObject?: LocaleObject;
    private loadLock = new AsyncLock();

    public constructor(localeClient: LocaleClient, route: string) {
        this.localeClient = localeClient;
        this.route = route;
    }

    public async createTranslator() {
        if (!this.localeObject && !this.loadLock.isLocked) await this.load();
        else if (!this.localeObject) await this.loadLock.wait();

        if (!this.localeObject) throw new Error('Failed to load locale object.')

        return new LocaleTranslator(this.localeObject);
    }

    private async load() {
        if (!this.localeObject) {
            this.loadLock.lock();
            const localeObject = await ky
                .get(`${CDN_URL}/locales/${this.localeClient.scope}/${this.route}`)
                .json<LocaleObject>();

            if (localeObject) this.localeObject = localeObject;
            this.loadLock.unlock();
        }
    }
}
