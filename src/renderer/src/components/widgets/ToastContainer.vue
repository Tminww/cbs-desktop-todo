<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useToast, Toast } from "@renderer/composables/useToast";

const { toasts, removeToast, clearAllToasts } = useToast();

// Настройки отображения
const maxVisibleToasts = ref(3);
const showAll = ref(false);

// Вычисляемые свойства
const visibleToasts = computed(() => {
  if (showAll.value || toasts.value.length <= maxVisibleToasts.value) {
    return toasts.value;
  }
  return toasts.value.slice(0, maxVisibleToasts.value);
});

const hiddenCount = computed(() => {
  if (showAll.value || toasts.value.length <= maxVisibleToasts.value) {
    return 0;
  }
  return toasts.value.length - maxVisibleToasts.value;
});

// Методы
const getToastClasses = (toast: Toast): string[] => {
  return [
    "toast-item",
    `toast-${toast.type}`,
    ...(toast.dismissible ? ["toast-dismissible"] : []),
  ];
};

const getIconClasses = (type: Toast["type"]): string[] => {
  return ["toast-icon", `toast-icon-${type}`];
};

const handleToastClick = (id: string): void => {
  removeToast(id);
};

const handleRemoveToast = (id: string): void => {
  removeToast(id);
};

const handleShowAll = (): void => {
  showAll.value = !showAll.value;
};

const handleClearHidden = (): void => {
  // Удаляем все скрытые toast-ы (начиная с 4-го)
  const hiddenToasts = toasts.value.slice(maxVisibleToasts.value);
  hiddenToasts.forEach((toast) => removeToast(toast.id));
};

// Сбрасываем показ всех когда toast-ов становится меньше лимита
const resetShowAll = () => {
  if (toasts.value.length <= maxVisibleToasts.value) {
    showAll.value = false;
  }
};

// Следим за изменением количества toast-ов
watch(() => toasts.value.length, resetShowAll);
</script>
<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in visibleToasts"
          :key="toast.id"
          :class="getToastClasses(toast)"
          @click="toast.dismissible && handleToastClick(toast.id)"
        >
          <div class="toast-content">
            <div :class="getIconClasses(toast.type)">
              <span v-if="toast.type === 'success'">✓</span>
              <span v-else-if="toast.type === 'error'">✕</span>
              <span v-else-if="toast.type === 'warning'">⚠</span>
              <span v-else-if="toast.type === 'info'">ℹ</span>
            </div>
            <div class="toast-message">{{ toast.message }}</div>
            <button
              v-if="toast.dismissible"
              class="toast-close"
              @click.stop="handleRemoveToast(toast.id)"
              aria-label="Закрыть уведомление"
            >
              ×
            </button>
          </div>
        </div>
      </TransitionGroup>
      <div
        v-if="hiddenCount > 0"
        key="hidden-indicator"
        class="toast-item toast-hidden-indicator"
        @click="handleShowAll"
      >
        <div class="toast-content">
          <div class="toast-icon toast-icon-hidden">
            <span>{{ hiddenCount }}</span>
          </div>
          <div class="toast-message">
            {{ hiddenCount }} скрытых уведомлений
            <span class="toast-show-all">Нажмите чтобы показать все</span>
          </div>
          <button
            class="toast-close"
            @click.stop="handleClearHidden"
            aria-label="Очистить скрытые уведомления"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
  max-width: 400px;
  min-width: 300px;
  pointer-events: auto;
  border-left: 4px solid;
  transition: all 0.2s ease;
}

.toast-success {
  border-left-color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-info {
  border-left-color: #3b82f6;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  color: white;
}

.toast-icon-success {
  background-color: #10b981;
}

.toast-icon-error {
  background-color: #ef4444;
}

.toast-icon-warning {
  background-color: #f59e0b;
}

.toast-icon-info {
  background-color: #3b82f6;
}

.toast-message {
  flex: 1;
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 2px;
}

.toast-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.toast-close:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.toast-dismissible {
  cursor: pointer;
}

.toast-dismissible:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.toast-hidden-indicator {
  border-left-color: #6b7280;
  cursor: pointer;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.toast-hidden-indicator:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.toast-icon-hidden {
  background-color: #6b7280;
  font-size: 10px;
  font-weight: bold;
}

.toast-show-all {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
  font-weight: normal;
}

/* Анимации */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
