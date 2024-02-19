import watermark from '../watermark'
import useSettingsStore from '@/store/modules/settings'
import useUserStore from '@/store/modules/user'

export default function useWatermark() {
  const settingsStore = useSettingsStore()
  const userStore = useUserStore()
  const { init, remove } = watermark()

  watch(() => settingsStore.settings.app.enableWatermark, (val) => {
    if (val) {
      loadWatermark()
    }
    else {
      removeWatermark()
    }
  }, {
    immediate: true,
  })

  watch(() => settingsStore.settings.app.colorScheme, () => {
    if (settingsStore.settings.app.enableWatermark) {
      loadWatermark()
    }
  })

  function loadWatermark() {
    // 水印更多设置请查看 watermark.ts
    init({
      text: `Fantastic-admin 水印测试 ${userStore.account}`,
      width: 150,
      x: 0,
      y: 0,
      x_space: 50,
      y_space: 50,
      alpha: 0.1,
      color: settingsStore.settings.app.colorScheme === 'light' ? 'black' : 'white',
    })
  }

  function removeWatermark() {
    try {
      remove()
    }
    catch (err) {
      // 忽略报错
    }
  }

  return {
    loadWatermark,
    removeWatermark,
  }
}
