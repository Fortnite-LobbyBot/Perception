import translator from 'google-translate-api-x';
import { writeFileSync, existsSync, readFileSync } from 'fs';

const settings = {
	langPaths: ['./src/locales/commands/'],
	rootLangFiles: ['./src/locales/commands/en.json'],
	rootLangCode: 'en',
	outputLangs: ['es', 'de', 'fr', 'pt', 'pl', 'it', 'tr'],
	translateDelay: 100,
	debug: true,
};

const colors = {
	blue: (str: string): string => `\x1B[1;34m${str}\x1B[1;0m`,
	green: (str: string): string => `\x1B[1;32m${str}\x1B[1;0m`,
	magenta: (str: string): string => `\x1B[1;35m${str}\x1B[1;0m`,
};

const debug = (text: string): void => {
	if (settings.debug)
		return console.log(`[ ${colors.magenta('Translator')} ] ${text}`);
};

debug(
	`${colors.blue('$')} Welcome to the ${colors.green('Translation Service')}`,
);

const translatorError = (text: string): void => {
	throw new Error(`[ Translator ] ${text}`);
};

const wait = (time: number) => new Promise((res) => setTimeout(res, time));

const main = async () => {
	let i = 0;

	for (const langPath of settings.langPaths) {
		const rootLangCode = settings.rootLangCode;

		debug(
			`[ ${colors.blue(
				'main',
			)} ] Starting root translation service (${colors.green(
				rootLangCode,
			)})`,
		);

		const rootFilePath = settings.rootLangFiles[i];

		if (!existsSync(rootFilePath))
			return translatorError(
				'[ main ] Invalid path provided on rootLangFile.',
			);

		debug(
			`[ ${colors.blue('main')} ] Opening root file: ${colors.green(
				rootFilePath,
			)}`,
		);

		const rootFileContent = readFileSync(rootFilePath, 'utf8');

		let rootFileObject = null;

		try {
			rootFileObject = JSON.parse(rootFileContent);
		} catch {
			return translatorError(
				`[ main ] The content in the root file ${rootFilePath} is not a valid JSON object.`,
			);
		}

		if (!rootFileObject)
			return translatorError('[ main ] Invalid root file object.');

		for (const langCode of settings.outputLangs) {
			debug(
				`[ ${colors.blue(rootLangCode)} => ${colors.blue(
					langCode,
				)} ] Starting translation service (${colors.green(langCode)})`,
			);

			const filePath = `${langPath}${langCode}.json`;

			if (!existsSync(filePath)) {
				debug(
					`[ ${colors.blue(rootLangCode)} => ${colors.blue(
						langCode,
					)} ] Creating file: ${colors.green(filePath)}`,
				);

				writeFileSync(filePath, '{}');
			}

			debug(
				`[ ${colors.blue(rootLangCode)} => ${colors.blue(
					langCode,
				)} ] Opening file: ${colors.green(filePath)}`,
			);

			const fileContent = readFileSync(filePath, 'utf8');

			let fileObject = null;

			try {
				fileObject = JSON.parse(fileContent);
			} catch {
				return translatorError(
					`[ ${rootLangCode} => ${langCode} ] The content in the file ${filePath} is not a valid JSON object.`,
				);
			}

			if (!fileObject)
				return translatorError(
					`[ ${rootLangCode} => ${langCode} ] Invalid file object.`,
				);

			const rootFileObjPath = {};

			deepMap(fileObject, ['root'], rootFileObjPath);

			const result = await translate(
				rootFileObject,
				rootLangCode,
				langCode,
				['root'],
				rootFileObjPath,
			);

			debug(
				`[ ${colors.blue(rootLangCode)} => ${colors.blue(
					langCode,
				)} ] Translation ended for ${colors.green(langCode)}`,
			);

			writeFileSync(filePath, JSON.stringify(result, null, 2));
		}

		i++;
	}
};

const isString = <Value>(val: Value): boolean => typeof val === 'string';

const isObject = <Value>(val: Value): boolean =>
	val === Object(val) &&
	Object.prototype.toString.call(val) !== '[object Array]';

const isArray = <Value>(val: Value): boolean => Array.isArray(val);

const translateString = async (
	text: string,
	fromLangCode: string,
	toLangCode: string,
	rootObjPath: string[],
	rootFileObjPath: Record<string, any>,
): Promise<string> => {
	const rootText = rootFileObjPath[rootObjPath.join('')];

	if (rootText && rootText !== 'untranslated') {
		debug(
			`[ ${colors.blue(fromLangCode)} => ${colors.blue(
				toLangCode,
			)} ] [ ${colors.magenta('skipped')} ] ${colors.green(
				rootObjPath.join(''),
			)} ==> ${colors.blue(rootText)}`,
		);

		return formatString(text, rootText);
	} else {
		debug(
			`[ ${colors.blue(fromLangCode)} => ${colors.blue(
				toLangCode,
			)} ] Starting translation for ${colors.green(
				rootObjPath.join(''),
			)} ==> ${colors.blue(text)}`,
		);

		await wait(settings.translateDelay);

		const result = await translator(text, {
			from: fromLangCode.split('-')[0],
			to: toLangCode.split('-')[0],
		});

		const translation = formatString(
			text,
			Array.isArray(result) ? result[0].text : result.text.toString(),
		);

		debug(
			`[ ${colors.blue(fromLangCode)} => ${colors.blue(
				toLangCode,
			)} ] Translation ended for ${colors.green(
				rootObjPath.join(''),
			)} ==> ${colors.blue(translation)}`,
		);

		return translation;
	}
};

const translateObject = async <
	TObject extends Record<string, any>,
	RObject extends Record<string, any>,
>(
	object: TObject,
	fromLangCode: string,
	toLangCode: string,
	rootObjPath: string[],
	rootFileObjPath: RObject,
) => {
	const result: Record<string, any> = {};

	let iteration = 0;

	const entries = Object.entries(object);

	for (const [key, value] of entries) {
		if (iteration === 0) {
			rootObjPath.push(`['${key}']`);
		} else {
			rootObjPath.splice(rootObjPath.length - 1, 1);
			rootObjPath.push(`['${key}']`);
		}

		const translatedValue = await translate(
			value,
			fromLangCode,
			toLangCode,
			rootObjPath,
			rootFileObjPath,
		);

		result[key] = translatedValue;

		iteration = iteration + 1;

		if (iteration === entries.length) {
			rootObjPath.splice(rootObjPath.length - 1, 1);
		}
	}

	return result;
};

const translateArray = async <TArray, RObject extends Record<string, any>>(
	array: TArray[],
	fromLangCode: string,
	toLangCode: string,
	rootObjPath: string[],
	rootFileObjPath: RObject,
) => {
	const result = [];

	let iteration = 0;

	for (const value of array) {
		if (iteration === 0) {
			rootObjPath.push(`[${iteration}]`);
		} else {
			rootObjPath.splice(rootObjPath.length - 1, 1);
			rootObjPath.push(`[${iteration}]`);
		}

		const translatedValue = await translate(
			value,
			fromLangCode,
			toLangCode,
			rootObjPath,
			rootFileObjPath,
		);

		result.push(translatedValue);

		iteration = iteration + 1;

		if (iteration === array.length) {
			rootObjPath.splice(rootObjPath.length - 1, 1);
		}
	}

	return result;
};

const translate = async <TSource, RObject extends Record<string, any>>(
	source: TSource,
	fromLangCode: string,
	toLangCode: string,
	rootObjPath: string[],
	rootFileObjPath: RObject,
): Promise<unknown> => {
	if (isString(source))
		return translateString(
			source as string,
			fromLangCode,
			toLangCode,
			rootObjPath,
			rootFileObjPath,
		);

	if (isObject(source))
		return translateObject(
			source as Record<string, any>,
			fromLangCode,
			toLangCode,
			rootObjPath,
			rootFileObjPath,
		);

	if (isArray(source))
		return translateArray(
			source as unknown[],
			fromLangCode,
			toLangCode,
			rootObjPath,
			rootFileObjPath,
		);

	return source;
};

const deepString = (
	text: string,
	rootObjPath: string[],
	rootFileObjPath: any,
): string => {
	rootFileObjPath[rootObjPath.join('')] = text;

	return text;
};

const deepObject = (
	object: any,
	rootObjPath: string[],
	rootFileObjPath: any,
): any => {
	const result: Record<string, any> = {};

	let iteration = 0;

	const entries = Object.entries(object);

	for (const [key, value] of entries) {
		if (iteration === 0) {
			rootObjPath.push(`['${key}']`);
		} else {
			rootObjPath.splice(rootObjPath.length - 1, 1);
			rootObjPath.push(`['${key}']`);
		}

		const deepValue = deepMap(value, rootObjPath, rootFileObjPath);
		result[key] = deepValue;

		iteration = iteration + 1;

		if (iteration === entries.length) {
			rootObjPath.splice(rootObjPath.length - 1, 1);
		}
	}

	return result;
};

const deepArray = (
	array: any[],
	rootObjPath: string[],
	rootFileObjPath: any,
): any[] => {
	const result = [];

	let iteration = 0;

	for (const value of array) {
		if (iteration === 0) {
			rootObjPath.push(`[${iteration}]`);
		} else {
			rootObjPath.splice(rootObjPath.length - 1, 1);
			rootObjPath.push(`[${iteration}]`);
		}

		const deepValue = deepMap(value, rootObjPath, rootFileObjPath);

		result.push(deepValue);

		iteration = iteration + 1;

		if (iteration === array.length) {
			rootObjPath.splice(rootObjPath.length - 1, 1);
		}
	}

	return result;
};

const deepMap = (
	source: any,
	rootObjPath: string[],
	rootFileObjPath: any,
): any => {
	if (isString(source))
		return deepString(source, rootObjPath, rootFileObjPath);

	if (isObject(source))
		return deepObject(source, rootObjPath, rootFileObjPath);

	if (isArray(source)) return deepArray(source, rootObjPath, rootFileObjPath);

	return source;
};

const formatString = (original: string, destination: string) => {
	const originalVars = original.match(/[{|"](.*?)[}|"]/gi);

	let i = 0;

	return destination.replace(/[{|"](.*?)[}|"]/gi, () => {
		const result = originalVars?.[i] ?? '';
		i++;
		return result;
	});
};

main().catch(() => null);
