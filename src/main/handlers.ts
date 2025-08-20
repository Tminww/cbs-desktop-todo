import { ipcMain } from "electron";
import { Doctor, Block, Meta } from "../types";
import { appStore } from "./store";

/**
 * Регистрация всех IPC handlers с использованием appStore напрямую
 */
export const registerHandlers = (): void => {
  // Тестовый хендлер
  ipcMain.handle("send-ping", async (event, arg) => {
    console.log("Ping received:", arg);
    return "pong";
  });
  // ==================== NEW API ====================

  // Получение мета-данных врачей
  ipcMain.handle("get-doctors-meta", async (event): Promise<Doctor[]> => {
    try {
      const doctors = await appStore.get("meta.doctors", []);
      return doctors;
    } catch (error) {
      console.error("Ошибка в get-doctors-meta:", error);
      return [];
    }
  });

  // Установка мета-данных врачей
  ipcMain.handle(
    "set-doctors-meta",
    async (event, doctors: Doctor[]): Promise<Doctor[]> => {
      try {
        await appStore.set("meta.doctors", doctors);
        return doctors;
      } catch (error) {
        console.error("Ошибка в set-doctors-meta:", error);
        throw error;
      }
    }
  );

  // Получение мета-данных блоков
  ipcMain.handle("get-blocks-meta", async (event): Promise<Block[]> => {
    try {
      const blocks = await appStore.get("meta.blocks", []);
      return blocks;
    } catch (error) {
      console.error("Ошибка в get-blocks-meta:", error);
      return [];
    }
  });

  // Установка мета-данных блоков
  ipcMain.handle(
    "set-blocks-meta",
    async (event, blocks: Block[]): Promise<Block[]> => {
      try {
        await appStore.set("meta.blocks", blocks);
        return blocks;
      } catch (error) {
        console.error("Ошибка в set-blocks-meta:", error);
        throw error;
      }
    }
  );

  // Получение врачей для конкретной даты
  ipcMain.handle(
    "get-doctors-date-meta",
    async (event, date: string): Promise<Doctor[]> => {
      try {
        const doctors = await appStore.get(`days.${date}.meta.doctors`, []);
        return doctors;
      } catch (error) {
        console.error("Ошибка в get-doctors-date-meta:", error);
        return [];
      }
    }
  );

  // Установка врачей для конкретной даты (создание пустых состояний)
  ipcMain.handle(
    "set-doctors-date-meta",
    async (event, date: string, doctors: Doctor[]): Promise<{}> => {
      try {
        await appStore.set(`days.${date}.meta.doctors`, doctors);
        return { status: "success" };
      } catch (error) {
        console.error("Ошибка в set-doctors-date-meta:", error);
        throw error;
      }
    }
  );

  // Получение блоков для конкретной даты
  ipcMain.handle(
    "get-blocks-date-meta",
    async (event, date: string): Promise<Block[]> => {
      try {
        const blocks = await appStore.get(`days.${date}.meta.blocks`, []);
        return blocks;
      } catch (error) {
        console.error("Ошибка в get-blocks-date-meta:", error);
        return [];
      }
    }
  );

  // Установка блоков для конкретной даты (обновляет у всех врачей)
  ipcMain.handle(
    "set-blocks-date-meta",
    async (event, date: string, blocks: Block[]): Promise<{}> => {
      try {
        await appStore.set(`days.${date}.meta.blocks`, blocks);

        return { status: "success" };
      } catch (error) {
        console.error("Ошибка в set-blocks-date-meta:", error);
        return { status: "error", message: error };
      }
    }
  );

  // Получение блоков для конкретного врача
  ipcMain.handle(
    "get-blocks-for-doctor",
    async (event, date: string, doctorName: string): Promise<Block[]> => {
      try {
        const blocks = await appStore.get(
          `days.${date}.${doctorName}.blocks`,
          []
        );
        return blocks;
      } catch (error) {
        console.error("Ошибка в get-blocks-for-doctor:", error);
        return [];
      }
    }
  );

  // Установка блоков для конкретного врача
  ipcMain.handle(
    "set-blocks-for-doctor",
    async (
      event,
      date: string,
      doctorName: string,
      blocks: Block[]
    ): Promise<Block[]> => {
      try {
        await appStore.set(`days.${date}.${doctorName}.blocks`, blocks);
        return blocks;
      } catch (error) {
        console.error("Ошибка в set-blocks-for-doctor:", error);
        throw error;
      }
    }
  );

  // Получение всех мета-данных
  ipcMain.handle("get-meta", async (event): Promise<Meta> => {
    try {
      const meta = await appStore.get("meta", { doctors: [], blocks: [] });
      return meta;
    } catch (error) {
      console.error("Ошибка в get-meta:", error);
      return { doctors: [], blocks: [] };
    }
  });

  // Установка всех мета-данных
  ipcMain.handle("set-meta", async (event, meta: Meta): Promise<{}> => {
    try {
      await appStore.set("meta", meta);
      return { status: "success" };
    } catch (error) {
      console.error("Ошибка в set-meta:", error);
      throw error;
    }
  });

  // Печать отчета (заглушка)
  ipcMain.handle(
    "print-report",
    async (event, date: string, doctors: Doctor[]): Promise<void> => {
      try {
        console.log(`Печать отчета для даты: ${date}, врачи:`, doctors);
        // Здесь будет логика печати отчета
      } catch (error) {
        console.error("Ошибка в print-report:", error);
        throw error;
      }
    }
  );

  // Получение текущей даты
  ipcMain.handle("get-current-date", async (event): Promise<string> => {
    try {
      return new Date().toISOString().split("T")[0];
    } catch (error) {
      console.error("Ошибка в get-current-date:", error);
      throw error;
    }
  });
};
