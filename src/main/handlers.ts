import { ipcMain } from "electron";
import { dataService } from "./service";
import { appStore, Meta, Block, Doctor } from "./store";

/**
 * Регистрация всех IPC handlers с использованием сервиса
 */
export const registerHandlers = (): void => {
  // Тестовый хендлер
  ipcMain.handle("send-ping", async (event, arg) => {
    console.log("Ping received:", arg);
    return "pong";
  });

  // Сохранение данных врача
  ipcMain.handle("save-file", async (event, args) => {
    try {
      const { date, doctor, content } = args;

      if (!date || !doctor || !content) {
        return {
          message: "Отсутствуют обязательные параметры",
          status: "error",
        };
      }

      // Проверяем, не является ли дата будущей
      if (dataService.isFutureDate(date)) {
        return {
          message: "Нельзя сохранять данные для будущих дат",
          status: "error",
        };
      }

      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (parseError) {
        return {
          message: "Некорректный формат данных",
          status: "error",
        };
      }

      // Валидируем данные
      if (!dataService.validateData(parsedData)) {
        return {
          message: "Данные не соответствуют требуемой структуре",
          status: "error",
        };
      }

      const success = await dataService.saveDoctorData(
        date,
        doctor,
        parsedData
      );

      if (success) {
        return {
          message: "Данные успешно сохранены",
          status: "success",
        };
      } else {
        return {
          message: "Ошибка при сохранении данных",
          status: "error",
        };
      }
    } catch (error) {
      console.error("Ошибка в save-file:", error);
      return {
        message: "Внутренняя ошибка при сохранении",
        status: "error",
      };
    }
  });

  // Загрузка данных
  ipcMain.handle("open-file", async (event, args) => {
    try {
      const { date, doctor } = args;

      // Если запрашиваются начальные данные
      if (date === "initial") {
        const initialData = await dataService.getInitialData();
        return {
          message: "Начальные данные загружены",
          status: "success",
          content: JSON.stringify(initialData),
        };
      }

      if (!date || !doctor) {
        return {
          message: "Отсутствуют обязательные параметры",
          status: "error",
        };
      }

      // Проверяем, не является ли дата будущей
      if (dataService.isFutureDate(date)) {
        return {
          message: "Нельзя просматривать данные для будущих дат",
          status: "error",
        };
      }

      const doctorData = await dataService.getDoctorData(date, doctor);

      if (doctorData) {
        return {
          message: "Данные врача загружены",
          status: "success",
          content: JSON.stringify(doctorData),
        };
      } else {
        // Если данных нет, создаем пустое состояние для текущего дня
        if (dataService.isToday(date)) {
          const emptyState = await dataService.createEmptyState(date, doctor);
          return {
            message: "Создано новое состояние",
            status: "success",
            content: JSON.stringify(emptyState),
          };
        } else {
          return {
            message: "Данные для выбранного врача и даты не найдены",
            status: "error",
          };
        }
      }
    } catch (error) {
      console.error("Ошибка в open-file:", error);
      return {
        message: "Внутренняя ошибка при загрузке",
        status: "error",
      };
    }
  });

  // Получение списка врачей по дате
  ipcMain.handle("get-doctors-by-date", async (event, args) => {
    try {
      const { date } = args;

      if (!date) {
        return {
          message: "Дата не указана",
          status: "error",
          doctors: [],
        };
      }

      // Проверяем, не является ли дата будущей
      if (dataService.isFutureDate(date)) {
        return {
          message: "Нельзя просматривать данные для будущих дат",
          status: "error",
          doctors: [],
        };
      }

      const doctors = await dataService.getDoctorsByDate(date);

      return {
        message:
          doctors.length > 0
            ? "Список врачей загружен"
            : "Врачей за указанную дату не найдено",
        status: "success",
        doctors,
      };
    } catch (error) {
      console.error("Ошибка в get-doctors-by-date:", error);
      return {
        message: "Внутренняя ошибка при получении списка врачей",
        status: "error",
        doctors: [],
      };
    }
  });

  // Новый хендлер для получения конфигурации
  ipcMain.handle("get-config", async (event, args) => {
    try {
      const initialData = await dataService.getInitialData();
      return {
        message: "Конфигурация загружена",
        status: "success",
        content: JSON.stringify(initialData),
      };
    } catch (error) {
      console.error("Ошибка в get-config:", error);
      return {
        message: "Ошибка при загрузке конфигурации",
        status: "error",
      };
    }
  });

  // Новый хендлер для обновления конфигурации
  ipcMain.handle("update-config", async (event, args) => {
    try {
      const { content } = args;

      if (!content) {
        return {
          message: "Содержимое конфигурации не указано",
          status: "error",
        };
      }

      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (parseError) {
        return {
          message: "Некорректный формат конфигурации",
          status: "error",
        };
      }

      // Валидируем конфигурацию
      if (!dataService.validateData(parsedData)) {
        return {
          message: "Конфигурация не соответствует требуемой структуре",
          status: "error",
        };
      }

      const success = await dataService.saveInitialData(parsedData);

      if (success) {
        return {
          message: "Конфигурация успешно обновлена",
          status: "success",
        };
      } else {
        return {
          message: "Ошибка при сохранении конфигурации",
          status: "error",
        };
      }
    } catch (error) {
      console.error("Ошибка в update-config:", error);
      return {
        message: "Внутренняя ошибка при обновлении конфигурации",
        status: "error",
      };
    }
  });

  // Хендлер для получения текущей даты
  ipcMain.handle("get-current-date", async (event, args) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      return {
        message: "Текущая дата получена",
        status: "success",
        date: currentDate,
      };
    } catch (error) {
      console.error("Ошибка в get-current-date:", error);
      return {
        message: "Ошибка при получении текущей даты",
        status: "error",
      };
    }
  });

  //new API

  ipcMain.handle("get-doctors-meta", async (event) => {
    try {
      const response = appStore.store.meta.doctors;
      return { status: "success", response };
    } catch (e) {
      return { status: "error", response: e };
    }
  });
  ipcMain.handle("set-doctors-meta", async (event, doctors: Doctor[]) => {
    const response = appStore.store.meta.doctors;
    return response;
  });

  ipcMain.handle("get-blocks-meta", async (event) => {});
  ipcMain.handle("set-blocks-meta", async (event, blocks: Block[]) => {});

  ipcMain.handle("get-doctors-date-meta", async (event, date: string) => {});
  ipcMain.handle(
    "set-doctors-date-meta",
    async (event, date: string, doctors: Doctor[]) => {}
  );

  ipcMain.handle("get-blocks-date-meta", async (event, date: string) => {});
  ipcMain.handle(
    "set-blocks-date-meta",
    async (event, date: string, blocks: Block[]) => {}
  );

  ipcMain.handle(
    "get-blocks-for-doctor",
    async (event, date: string, doctorName: string) => {}
  );
  ipcMain.handle(
    "set-blocks-for-doctor",
    async (event, date: string, doctorName: string, blocks: Block[]) => {}
  );

  ipcMain.handle("get-meta", async (event) => {});
  ipcMain.handle("set-meta", async (event, meta: Meta) => {});
  ipcMain.handle(
    "print-report",
    async (event, date: string, doctorName: string) => {}
  );
  ipcMain.handle("get-current-date", async (event) => {});
};
