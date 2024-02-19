import { cloneDeep } from 'lodash-es'
import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'
import useSettingsStore from '@/store/modules/settings'

function setupI18n() {
  const settingsStore = useSettingsStore()
  const i18n = createI18n({
    legacy: false,
    locale: settingsStore.lang,
    flatJson: true,
    fallbackLocale: 'zh-cn',
    messages,
  })
  return i18n
}

function getLocales() {
  return cloneDeep(messages)
}

const localesName: { [key: string]: any } = {}
for (const key in messages) {
  switch (key) {
    case 'zh-cn':
      localesName[key] = '中文(简体)'
      break
    case 'zh-tw':
      localesName[key] = '中文(繁體)'
      break
    case 'en':
      localesName[key] = 'English'
      break
  }
}

export {
  setupI18n,
  getLocales,
  localesName,
}
