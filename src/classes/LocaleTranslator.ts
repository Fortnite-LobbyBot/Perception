import type { LocaleObject } from "../types/LocaleObject";

export class LocaleTranslator {
    private localeObject: LocaleObject;

    public constructor(localeObject: LocaleObject) {
        this.localeObject = localeObject;
    }

    public translate(key: string, variables?: Record<string, string>) {
        const result = this.localeObject?.[key];

        return (
            result?.replace(/{(.*?)}/gi, (_match, value) => {
                return variables?.[value] ?? '';
            }) ?? `TRANSLATION_ERROR: KEY "${key}"`
        );
    }
}
