<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import Message from 'vue-m-message'
import useSettingsStore from '@/store/modules/settings'

defineOptions({
  name: 'LinkView',
})

const route = useRoute()
const settingsStore = useSettingsStore()

const { copy, copied } = useClipboard()
watch(copied, (val) => {
  val && Message.success('复制成功')
})

function open() {
  window.open(route.meta.link, '_blank')
}
</script>

<template>
  <div class="absolute h-full w-full flex flex-col">
    <Transition :name="settingsStore.settings.mainPage.enableTransition ? settingsStore.settings.mainPage.transitionMode : ''" mode="out-in" appear>
      <PageMain :key="route.meta.link" class="flex flex-1 flex-col justify-center">
        <div class="flex flex-col items-center">
          <SvgIcon name="icon-park-twotone:planet" :size="120" class="text-ui-primary/80" />
          <div class="my-2 text-xl text-dark dark:text-white">
            是否访问此链接
          </div>
          <div class="my-2 max-w-[300px] cursor-pointer text-center text-[14px] text-stone-5" @click="route.meta.link && copy(route.meta.link)">
            <HTooltip text="复制链接">
              <div class="line-clamp-3">
                {{ route.meta.link }}
              </div>
            </HTooltip>
          </div>
          <HButton class="my-4" @click="open">
            <SvgIcon name="ri:external-link-fill" />
            立即访问
          </HButton>
        </div>
      </PageMain>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.fade-enter-active,
.slide-left-enter-active,
.slide-right-enter-active,
.slide-top-enter-active,
.slide-bottom-enter-active {
  transition: 0.2s;
}

.fade-leave-active,
.slide-left-leave-active,
.slide-right-leave-active,
.slide-top-leave-active,
.slide-bottom-leave-active {
  transition: 0.15s;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-from {
  opacity: 0;
  margin-left: 20px;
}

.slide-left-leave-to {
  opacity: 0;
  margin-left: -20px;
}

.slide-right-enter-from {
  opacity: 0;
  margin-left: -20px;
}

.slide-right-leave-to {
  opacity: 0;
  margin-left: 20px;
}

.slide-top-enter-from {
  opacity: 0;
  margin-top: 20px;
}

.slide-top-leave-to {
  opacity: 0;
  margin-top: -20px;
}

.slide-bottom-enter-from {
  opacity: 0;
  margin-top: -20px;
}

.slide-bottom-leave-to {
  opacity: 0;
  margin-top: 20px;
}
</style>
