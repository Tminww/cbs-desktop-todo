<script setup lang="ts">
import { Toaster } from "vue-sonner";
import MainPage from "@renderer/components/pages/MainPage.vue";
import ConfirmDialog from "@renderer/components/widgets/ConfirmDialog.vue";
import { useConfirm } from "@renderer/composables/useConfirm";

const { confirmState, handleConfirm, handleCancel } = useConfirm();
</script>

<template>
  <MainPage />
  <ConfirmDialog
    v-if="confirmState.isVisible"
    :title="confirmState.title"
    :message="confirmState.message"
    :ok-text="confirmState.okText"
    :cancel-text="confirmState.cancelText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />

  <Toaster richColors position="top-right" :expand="false" />
</template>

<style scoped></style>
