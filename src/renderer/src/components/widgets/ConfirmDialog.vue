<!-- ConfirmDialog.vue -->
<template>
  <div class="confirm-overlay" @click.self="cancel">
    <div class="confirm-dialog">
      <div class="confirm-header">
        <h3>{{ title }}</h3>
      </div>
      <div class="confirm-body">
        <p>{{ message }}</p>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" @click="cancel">
          {{ cancelText }}
        </button>
        <button class="confirm-btn confirm-btn-ok" @click="confirm">
          {{ okText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

// Интерфейс для props
interface Props {
  title?: string;
  message?: string;
  okText?: string;
  cancelText?: string;
}

// Props с значениями по умолчанию
const props = withDefaults(defineProps<Props>(), {
  title: "Подтверждение",
  message: "Вы уверены?",
  okText: "ОК",
  cancelText: "Отмена",
});

// Интерфейс для событий
interface Emits {
  confirm: [];
  cancel: [];
}

const emit = defineEmits<Emits>();

// Методы
const confirm = (): void => {
  emit("confirm");
};

const cancel = (): void => {
  emit("cancel");
};

// Обработка Escape
const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === "Escape") {
    cancel();
  }
};

// Lifecycle hooks
onMounted((): void => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted((): void => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.confirm-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  max-width: 500px;
  overflow: hidden;
}

.confirm-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.confirm-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.confirm-body {
  padding: 20px;
}

.confirm-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.confirm-actions {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: #f8f9fa;
}

.confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.confirm-btn-cancel {
  background: #f1f3f4;
  color: #666;
}

.confirm-btn-cancel:hover {
  background: #e8eaed;
}

.confirm-btn-ok {
  background: #1976d2;
  color: white;
}

.confirm-btn-ok:hover {
  background: #1565c0;
}

.confirm-btn:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}
</style>
