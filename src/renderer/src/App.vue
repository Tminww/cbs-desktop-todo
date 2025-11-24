<!-- src/renderer/src/App.vue -->
<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import { ref, onMounted } from 'vue';
import PrimeVue from 'primevue/config';
import MainPage from '@renderer/components/pages/MainPage.vue';
import ConfirmDialog from '@renderer/components/widgets/ConfirmDialog.vue';
import { useConfirm } from '@renderer/composables/useConfirm';

const { confirmState, handleConfirm, handleCancel } = useConfirm();
const currentPage = ref('report');
</script>

<template>
  <div class="app-container">
    <MainPage />
    <ConfirmDialog v-if="confirmState.isVisible" :title="confirmState.title" :message="confirmState.message"
      :ok-text="confirmState.okText" :cancel-text="confirmState.cancelText" @confirm="handleConfirm"
      @cancel="handleCancel" />
    <Toaster richColors position="top-right" :expand="false" />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: var(--surface-ground);
}
</style>

<style>
:root {
  --primary-color: #3b82f6;
  --primary-400: #60a5fa;
  --primary-600: #2563eb;
  --surface-ground: #f3f4f6;
  --surface-card: #ffffff;
  --text-color: #1f2937;
  --text-color-secondary: #6b7280;
  --border-color: #e5e7eb;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

#app {
  width: 100%;
}
</style>