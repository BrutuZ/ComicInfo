import { createApp } from 'vue'
import App from './App.vue'
// import router from './router'

// Import our custom CSS
import './styles.scss'
import { Tooltip } from 'bootstrap'

// import Alert from 'bootstrap/js/dist/alert';

// or, specify which plugins you need:
// import { Tooltip, Toast, Popover } from 'bootstrap';

declare global {
  let DEV: boolean
}

export function stringToList(value: string | undefined) {
  return (value || '')
    .split(/ *, */)
    .map(item => stripCounter(item))
    .filter(item => item)
}

export function stripCounter(text: string | undefined) {
  return text ? text.trim().replace(/ [\d,()]+$/, '') : ''
}

export function stripHtmlTags(text?: string) {
  const div = document.createElement('div')
  div.innerHTML = text || ''
  return div.textContent || div.innerText || ''
}
export function dateToString(value: Date): string
export function dateToString(value: string): Date
export function dateToString(value: Date | string): string | Date {
  return typeof value == 'string'
    ? new Date(value)
    : [
        value.getUTCFullYear(),
        (value.getUTCMonth() + 1).toString().padStart(2, '0'),
        value.getUTCDate().toString().padStart(2, '0'),
      ].join('-')
}

export function listField(value: string): string[]
export function listField(value: string[]): string
export function listField(value: string | string[]): string[] | string {
  return typeof value == 'string'
    ? value
        .split(/ *[,\/|] */)
        .map(item => item.trim())
        .filter(item => item)
    : value.join(', ')
}

export function capitalizeTags(str: string) {
  return str.replace('_', ' ').replace(/(?<=[\\/]?)\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  })
}

export function bsTooltips() {
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  return {
    create: (options?: Partial<Tooltip.Options>) => {
      tooltips.forEach(el => new Tooltip(el, options))
    },

    destroy: () => {
      tooltips.forEach(el => Tooltip.getInstance(el)?.dispose())
    },
  }
}

const app = createApp(App)

export const DEV = import.meta.env.DEV

// app.use(router)

app.mount('#container')
