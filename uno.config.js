import { defineConfig, presetUno, presetIcons } from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'

export default defineConfig({
	extractors: [
		extractorSvelte(),
	],
  presets: [
    presetUno(),
		presetIcons({
			cdn: 'https://esm.sh/'
		})
  ],
})