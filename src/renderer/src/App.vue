<script setup lang="ts">
import MainPage from "@renderer/components/pages/MainPage.vue";
import ConfirmDialog from "@renderer/components/widgets/ConfirmDialog.vue";
import { useConfirm } from "@renderer/composables/useConfirm";
import ToastContainer from "@renderer/components/widgets/ToastContainer.vue";
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
  <ToastContainer />
</template>

<style scoped></style>
