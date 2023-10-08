import 'uno.css'
import '@unocss/reset/tailwind.css'
import 'pell/dist/pell.min.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
})

export default app
