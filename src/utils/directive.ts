import type { App } from 'vue'
import Waves from 'node-waves'
import 'node-waves/dist/waves.min.css'

export default function directive(app: App) {
  // 注册 v-auth 和 v-auth-all 指令
  app.directive('auth', {
    mounted: (el, binding) => {
      if (!useAuth().auth(binding.value)) {
        el.remove()
      }
    },
  })
  app.directive('auth-all', {
    mounted: (el, binding) => {
      if (!useAuth().authAll(binding.value)) {
        el.remove()
      }
    },
  })
  app.directive('timeago', {
    mounted: (el, binding) => {
      el.textContent = useTimeago().format(binding.value)
      if (binding.modifiers.interval) {
        el.__timeagoSetInterval__ = setInterval(() => {
          el.textContent = useTimeago().format(binding.value)
        }, 1000)
      }
    },
    beforeUnmount: (el, binding) => {
      if (binding.modifiers.interval) {
        clearInterval(el.__timeagoSetInterval__)
      }
    },
  })
  // 注册 Waves 指令
  app.directive('waves', {
    created: () => {
      Waves.init()
    },
    mounted: (el, binding) => {
      const classes = ['button', 'circle', 'block', 'float', 'light', 'classic'].filter(cls => binding.modifiers[cls]).map(cls => `waves-${cls}`)
      Waves.attach(el, classes)
    },
  })
}
