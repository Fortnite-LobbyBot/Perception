import { LocaleClient, Locales } from '../src/index';

const localeClient = new LocaleClient('bot');

const ctx1p = localeClient.getContext('commands', Locales.Es);
const ctx = await localeClient.getContext('commands', Locales.Es);
const ctx2 = await localeClient.getContext('commands', Locales.Es);
const ctx3 = await localeClient.getContext('commands', Locales.Default);


const ctx1 = await ctx1p

if (!ctx || !ctx1 || !ctx2 || !ctx3) throw new Error(`Could not fetch context`)

    const cosmeticTranslator = ctx.createTranslator({ module: 'run.cosmetic' });

console.log(
    cosmeticTranslator.translate('msg.cosmetic_changed', {
        type: 'Test 1',
        name: 'Test 2'
    })
);

const cosmeticTranslator1 = ctx1.createTranslator({ module: 'run.cosmetic' });
const cosmeticTranslator2 = ctx2.createTranslator({ module: 'run.cosmetic' });
const cosmeticTranslator3 = ctx3.createTranslator({ module: 'run.cosmetic' });

console.log(
    cosmeticTranslator1.translate('msg.cosmetic_changed', {
        type: 'Test 1 c1',
        name: 'Test 2'
    })
);

console.log(
    cosmeticTranslator2.translate('msg.cosmetic_changed', {
        type: 'Test 1 c2',
        name: 'Test 2'
    })
);

console.log(
    cosmeticTranslator3.translate('msg.cosmetic_changed', {
        type: 'Test 1 c3',
        name: 'Test 2'
    })
);

console.log(cosmeticTranslator.translate('invalid.test'));

const testTranslator = ctx.createTranslator({ module: 'test.module' });

console.log(testTranslator.translate('invalid.test'));
