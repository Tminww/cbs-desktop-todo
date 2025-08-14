// @renderer/api.ts

// Интерфейсы для типизации API
export interface ApiResponse<T = any> {
  message: string;
  status: "success" | "error";
}

export interface SaveFileResponse extends ApiResponse {}

export interface OpenFileResponse extends ApiResponse {
  content?: string;
}

export interface GetDoctorsByDateResponse extends ApiResponse {
  doctors: string[];
}

export interface GetConfigResponse extends ApiResponse {
  content?: string;
}

export interface GetCurrentDateResponse extends ApiResponse {
  date?: string;
}

export interface SaveFileArgs {
  content: string;
  date: string;
  doctor: string;
}

export interface OpenFileArgs {
  date: string;
  doctor?: string;
}

export interface GetDoctorsByDateArgs {
  date: string;
}

export interface UpdateConfigArgs {
  content: string;
}

// Декларация глобального объекта window с backend API
declare global {
  interface Window {
    backend: {
      sendPing: (arg: any) => Promise<string>;

      saveFile: (args: SaveFileArgs) => Promise<SaveFileResponse>;

      openFile: (args: OpenFileArgs) => Promise<OpenFileResponse>;

      getDoctorsByDate: (
        args: GetDoctorsByDateArgs
      ) => Promise<GetDoctorsByDateResponse>;

      getConfig: () => Promise<GetConfigResponse>;

      updateConfig: (args: UpdateConfigArgs) => Promise<ApiResponse>;

      getCurrentDate: () => Promise<GetCurrentDateResponse>;
    };
  }
}

// Проверка доступности API
const checkApiAvailability = (): void => {
  if (!window.backend) {
    throw new Error(
      "Backend API недоступно. Убедитесь, что preload скрипт загружен корректно."
    );
  }
};

// Обертка для безопасного вызова API с обработкой ошибок
export const api = {
  /**
   * Тестовый метод для проверки связи с backend
   */
  sendPing: async (arg: any): Promise<string> => {
    checkApiAvailability();
    try {
      return await window.backend.sendPing(arg);
    } catch (error) {
      console.error("Ошибка в sendPing:", error);
      throw error;
    }
  },

  /**
   * Сохранение данных врача
   */
  saveFile: async (args: SaveFileArgs): Promise<SaveFileResponse> => {
    checkApiAvailability();
    try {
      if (!args.content || !args.date || !args.doctor) {
        throw new Error("Отсутствуют обязательные параметры для сохранения");
      }
      return await window.backend.saveFile(args);
    } catch (error) {
      console.error("Ошибка в saveFile:", error);
      throw error;
    }
  },

  /**
   * Открытие данных врача или конфигурации
   */
  openFile: async (args: OpenFileArgs): Promise<OpenFileResponse> => {
    checkApiAvailability();
    try {
      if (!args.date) {
        throw new Error("Дата является обязательным параметром");
      }
      return await window.backend.openFile(args);
    } catch (error) {
      console.error("Ошибка в openFile:", error);
      throw error;
    }
  },

  /**
   * Получение списка врачей по дате
   */
  getDoctorsByDate: async (
    args: GetDoctorsByDateArgs
  ): Promise<GetDoctorsByDateResponse> => {
    checkApiAvailability();
    try {
      if (!args.date) {
        throw new Error("Дата является обязательным параметром");
      }
      return await window.backend.getDoctorsByDate(args);
    } catch (error) {
      console.error("Ошибка в getDoctorsByDate:", error);
      throw error;
    }
  },

  /**
   * Получение конфигурации приложения
   */
  getConfig: async (): Promise<GetConfigResponse> => {
    checkApiAvailability();
    try {
      return await window.backend.getConfig();
    } catch (error) {
      console.error("Ошибка в getConfig:", error);
      throw error;
    }
  },

  /**
   * Обновление конфигурации приложения
   */
  updateConfig: async (args: UpdateConfigArgs): Promise<ApiResponse> => {
    checkApiAvailability();
    try {
      if (!args.content) {
        throw new Error(
          "Содержимое конфигурации является обязательным параметром"
        );
      }
      return await window.backend.updateConfig(args);
    } catch (error) {
      console.error("Ошибка в updateConfig:", error);
      throw error;
    }
  },

  /**
   * Получение текущей даты с сервера
   */
  getCurrentDate: async (): Promise<GetCurrentDateResponse> => {
    checkApiAvailability();
    try {
      return await window.backend.getCurrentDate();
    } catch (error) {
      console.error("Ошибка в getCurrentDate:", error);
      throw error;
    }
  },
};

// Утилиты для работы с API
export const apiUtils = {
  /**
   * Проверяет успешность ответа API
   */
  isSuccess: (response: ApiResponse): boolean => {
    return response.status === "success";
  },

  /**
   * Проверяет, является ли ответ ошибкой
   */
  isError: (response: ApiResponse): boolean => {
    return response.status === "error";
  },

  /**
   * Получает сообщение из ответа API
   */
  getMessage: (response: ApiResponse): string => {
    return response.message || "Неизвестная ошибка";
  },

  /**
   * Форматирует дату в формат YYYY-MM-DD
   */
  formatDate: (date: Date): string => {
    return date.toISOString().split("T")[0];
  },

  /**
   * Парсит дату из строки
   */
  parseDate: (dateStr: string): Date => {
    return new Date(dateStr);
  },

  /**
   * Проверяет, является ли дата сегодняшней
   */
  isToday: (dateStr: string): boolean => {
    const today = new Date();
    const checkDate = new Date(dateStr);
    return today.toDateString() === checkDate.toDateString();
  },

  /**
   * Проверяет, является ли дата будущей
   */
  isFuture: (dateStr: string): boolean => {
    const today = new Date();
    const checkDate = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  },
};
