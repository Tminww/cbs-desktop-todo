import { ipcMain } from "electron";
import * as fs from "fs/promises";
import path from "path";
import { app } from "electron";

const dataDir = path.join(app.getPath("userData"), "states");

// Утилитные функции для работы с файлами
const ensureDataDir = async (): Promise<void> => {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

const save = async (fileName: string, content: string): Promise<boolean> => {
  try {
    await ensureDataDir();
    const filePath = path.join(dataDir, fileName);
    await fs.writeFile(filePath, content);
    return true;
  } catch {
    return false;
  }
};

const load = async (fileName: string): Promise<string | false> => {
  try {
    const filePath = path.join(dataDir, fileName);
    const data = await fs.readFile(filePath, "utf8");
    return data;
  } catch {
    return false;
  }
};

const loadDayData = async (date: string): Promise<any> => {
  try {
    const filePath = path.join(dataDir, `day-${date}.json`);
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
};

const saveDayData = async (date: string, dayData: any): Promise<boolean> => {
  try {
    await ensureDataDir();
    const filePath = path.join(dataDir, `day-${date}.json`);
    await fs.writeFile(filePath, JSON.stringify(dayData, null, 2));
    return true;
  } catch {
    return false;
  }
};

// Регистрация всех IPC handlers
export const registerApi = (): void => {
  ipcMain.handle("send-ping", async (event, arg) => {
    console.log(arg);
    return "pong";
  });

  // Новый обработчик для сохранения данных с учетом множественных пользователей
  ipcMain.handle("save-file", async (event, args) => {
    console.log(args);
    const { date, doctor, content } = args;

    // Загружаем существующие данные за день
    const dayData = await loadDayData(date);

    // Обновляем данные для конкретного врача
    dayData[doctor] = JSON.parse(content);

    if (await saveDayData(date, dayData)) {
      return {
        message: "Успешное сохранение",
        status: "success",
      };
    } else {
      return {
        message: "При сохранении произошла ошибка",
        status: "error",
      };
    }
  });

  // Обработчик для загрузки данных конкретного врача
  ipcMain.handle("open-file", async (event, args) => {
    console.log(args);
    const { date, doctor } = args;

    if (date === "initial") {
      const content = await load("state-initial.json");
      if (content) {
        return {
          message: "Успешная загрузка",
          status: "success",
          content,
        };
      } else {
        return {
          message: "При загрузке данных произошла ошибка",
          status: "error",
        };
      }
    }

    const dayData = await loadDayData(date);
    const doctorData = dayData[doctor];

    if (doctorData) {
      return {
        message: "Успешная загрузка",
        status: "success",
        content: JSON.stringify(doctorData),
      };
    } else {
      return {
        message: "Данные для выбранного врача не найдены",
        status: "error",
      };
    }
  });

  // Новый обработчик для получения списка врачей за конкретный день
  ipcMain.handle("get-doctors-by-date", async (event, args) => {
    console.log(args);
    const { date } = args;

    const dayData = await loadDayData(date);
    const doctors = Object.keys(dayData);

    return {
      message: "Успешная загрузка списка врачей",
      status: "success",
      doctors,
    };
  });
};
