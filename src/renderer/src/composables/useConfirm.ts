// composables/useConfirm.ts
import { ref, type Ref } from "vue";

// Интерфейс для опций confirm диалога
export interface ConfirmOptions {
  title?: string;
  okText?: string;
  cancelText?: string;
}

// Интерфейс для состояния confirm диалога
interface ConfirmState {
  isVisible: boolean;
  title: string;
  message: string;
  okText: string;
  cancelText: string;
  resolvePromise: ((value: boolean) => void) | null;
}

// Глобальное состояние для confirm диалога
const confirmState = ref<ConfirmState>({
  isVisible: false,
  title: "Подтверждение",
  message: "",
  okText: "ОК",
  cancelText: "Отмена",
  resolvePromise: null,
});

// Интерфейс возвращаемого значения композабла
export interface UseConfirmReturn {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  confirmState: Ref<ConfirmState>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export function useConfirm(): UseConfirmReturn {
  const confirm = (
    message: string,
    options: ConfirmOptions = {}
  ): Promise<boolean> => {
    console.log(
      "useConfirm called with message:",
      message,
      "and options:",
      options
    );
    return new Promise<boolean>((resolve) => {
      confirmState.value = {
        isVisible: true,
        title: options.title || "Подтверждение",
        message,
        okText: options.okText || "ОК",
        cancelText: options.cancelText || "Отмена",
        resolvePromise: resolve,
      };
    });
  };

  const handleConfirm = (): void => {
    if (confirmState.value.resolvePromise) {
      confirmState.value.resolvePromise(true);
    }
    confirmState.value.isVisible = false;
    confirmState.value.resolvePromise = null;
  };

  const handleCancel = (): void => {
    if (confirmState.value.resolvePromise) {
      confirmState.value.resolvePromise(false);
    }
    confirmState.value.isVisible = false;
    confirmState.value.resolvePromise = null;
  };

  return {
    confirm,
    confirmState,
    handleConfirm,
    handleCancel,
  };
}
