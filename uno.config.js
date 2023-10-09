import { defineConfig, presetUno, presetIcons, transformerVariantGroup } from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'

export default defineConfig({
	extractors: [
		extractorSvelte(),
	],
	transformers:[
		transformerVariantGroup()
	],
  presets: [
    presetUno(),
		presetIcons({
			cdn: 'https://esm.sh/'
		})
  ],
})