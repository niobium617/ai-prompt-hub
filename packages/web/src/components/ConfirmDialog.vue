<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  title?: string;
  message?: string;
  danger?: boolean;
  confirmText?: string;
}>();
const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-[9999] flex items-center justify-center p-6">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('cancel')"></div>
        <!-- 弹窗 -->
        <div class="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          <div class="p-6 pb-0">
            <h3 class="text-lg font-semibold text-gray-800">{{ title || '确认操作' }}</h3>
            <p class="text-sm text-gray-500 mt-2 leading-relaxed">{{ message }}</p>
          </div>
          <div class="flex gap-3 p-6 pt-5">
            <button
              class="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition"
              @click="emit('cancel')"
            >取消</button>
            <button
              class="flex-1 py-2.5 rounded-xl text-white font-medium transition"
              :class="danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600'"
              @click="emit('confirm')"
            >{{ confirmText || '确认' }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
