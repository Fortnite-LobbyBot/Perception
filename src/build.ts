import { $ } from 'bun';
import dts from 'bun-plugin-dts';

await Bun.build({
	entrypoints: ['./src/index.ts'],
	outdir: './dist',
	minify: true,
	plugins: [dts()]
});

await $`rm -rf dist/locales`
await $`cp -R src/locales dist/locales`
