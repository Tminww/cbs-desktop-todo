import { ref, type Ref } from "vue";
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  dismissible?: boolean;
}

export interface ToastOptions {
  duration?: number;
  dismissible?: boolean;
}

const toasts = ref<Toast[]>([]);
let toastIdCounter = 0;

const generateId = (): string => {
  return `toast-${++toastIdCounter}-${Date.now()}`;
};

// Интерфейс объекта toast
export interface ToastMethods {
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  clear: () => void;
  remove: (id: string) => void;
}

// Интерфейс возвращаемого значения композабла
export interface UseToastReturn {
  toasts: Ref<Toast[]>;
  toast: ToastMethods;
  addToast: (
    message: string,
    type: Toast["type"],
    options?: ToastOptions
  ) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export function useToast(): UseToastReturn {
  const addToast = (
    message: string,
    type: Toast["type"],
    options: ToastOptions = {}
  ): string => {
    const id = generateId();
    const toast: Toast = {
      id,
      message,
      type,
      duration: options.duration ?? 4000,
      dismissible: options.dismissible ?? true,
    };
    const delay = 300;
    // 300ms = примерно длительность анимации leave

    setTimeout(() => {
      toasts.value.push(toast);
    }, delay);

    // Автоматическое удаление через заданное время
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  };

  const removeToast = (id: string): void => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAllToasts = (): void => {
    toasts.value = [];
  };

  const success = (message: string, options?: ToastOptions): string =>
    addToast(message, "success", options);

  const error = (message: string, options?: ToastOptions): string =>
    addToast(message, "error", options);

  const warning = (message: string, options?: ToastOptions): string =>
    addToast(message, "warning", options);

  const info = (message: string, options?: ToastOptions): string =>
    addToast(message, "info", options);

  // Создаем объект toast с методами
  const toast: ToastMethods = {
    success,
    error,
    warning,
    info,
    clear: clearAllToasts,
    remove: removeToast,
  };

  return {
    toasts,
    toast,
    addToast,
    removeToast,
    clearAllToasts,
  };
}
