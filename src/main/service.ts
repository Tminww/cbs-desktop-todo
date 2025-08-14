import { app } from "electron";
import path from "path";
import * as fs from "fs/promises";

const dataDir = path.join(app.getPath("userData"), "states");

export interface TaskState {
  complete: boolean;
  notComplete: boolean;
}

export interface Task {
  number: number;
  label: string;
  state: TaskState;
  description: string;
}

export interface Block {
  label: string;
  tasks: Task[];
}

export interface Doctor {
  name: string;
}

export interface DayData {
  doctors: Doctor[];
  blocks: Block[];
  date: string;
}

export interface DayDataStorage {
  [doctorName: string]: DayData;
}

/**
 * Сервис для работы с данными приложения
 */
export class DataService {
  private dataDir: string;

  constructor() {
    this.dataDir = dataDir;
  }

  /**
   * Обеспечивает существование директории данных
   */
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  /**
   * Получает данные за конкретный день
   */
  async getDayData(date: string): Promise<DayDataStorage> {
    try {
      const filePath = path.join(this.dataDir, `day-${date}.json`);
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  /**
   * Сохраняет данные врача за конкретный день
   */
  async saveDoctorData(
    date: string,
    doctor: string,
    data: DayData
  ): Promise<boolean> {
    try {
      await this.ensureDataDir();

      // Загружаем существующие данные за день
      const dayData = await this.getDayData(date);

      // Обновляем данные для конкретного врача
      dayData[doctor] = {
        ...data,
        date,
        doctors: [{ name: doctor }],
      };

      const filePath = path.join(this.dataDir, `day-${date}.json`);
      await fs.writeFile(filePath, JSON.stringify(dayData, null, 2));
      return true;
    } catch (error) {
      console.error("Ошибка сохранения данных:", error);
      return false;
    }
  }

  /**
   * Получает данные конкретного врача за день
   */
  async getDoctorData(date: string, doctor: string): Promise<DayData | null> {
    try {
      const dayData = await this.getDayData(date);
      return dayData[doctor] || null;
    } catch {
      return null;
    }
  }

  /**
   * Получает список врачей, у которых есть данные за конкретный день
   */
  async getDoctorsByDate(date: string): Promise<string[]> {
    try {
      const dayData = await this.getDayData(date);
      return Object.keys(dayData);
    } catch {
      return [];
    }
  }

  /**
   * Получает начальные данные (конфигурация)
   */
  async getInitialData(): Promise<DayData> {
    try {
      const filePath = path.join(this.dataDir, "state-initial.json");
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch {
      // Если файл не найден, создаем его с начальными данными
      await this.saveInitialData(initial);
      return initial;
    }
  }

  /**
   * Сохраняет начальные данные (конфигурация)
   */
  async saveInitialData(data: DayData): Promise<boolean> {
    try {
      await this.ensureDataDir();
      const filePath = path.join(this.dataDir, "state-initial.json");
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error("Ошибка сохранения начальных данных:", error);
      return false;
    }
  }

  /**
   * Создает пустое состояние на основе начального шаблона
   */
  async createEmptyState(date: string, doctor: string): Promise<DayData> {
    const initialData = await this.getInitialData();

    return {
      doctors: [{ name: doctor }],
      blocks: initialData.blocks.map((block) => ({
        ...block,
        tasks: block.tasks.map((task) => ({
          ...task,
          state: { complete: false, notComplete: false },
          description: "",
        })),
      })),
      date,
    };
  }

  /**
   * Проверяет, является ли дата будущей
   */
  isFutureDate(dateStr: string): boolean {
    const inputDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate > today;
  }

  /**
   * Проверяет, является ли дата сегодняшней
   */
  isToday(dateStr: string): boolean {
    const inputDate = new Date(dateStr);
    const today = new Date();

    return inputDate.toDateString() === today.toDateString();
  }

  /**
   * Применяет "отметить все" к данным
   */
  applyCheckAll(data: DayData, checked: boolean): DayData {
    return {
      ...data,
      blocks: data.blocks.map((block) => ({
        ...block,
        tasks: block.tasks.map((task) => ({
          ...task,
          state: {
            complete: checked,
            notComplete: false,
          },
        })),
      })),
    };
  }

  /**
   * Валидирует структуру данных
   */
  validateData(data: any): data is DayData {
    if (!data || typeof data !== "object") return false;
    if (!Array.isArray(data.doctors)) return false;
    if (!Array.isArray(data.blocks)) return false;
    if (typeof data.date !== "string") return false;

    return data.blocks.every(
      (block: any) =>
        block.label &&
        Array.isArray(block.tasks) &&
        block.tasks.every(
          (task: any) =>
            typeof task.number === "number" &&
            typeof task.label === "string" &&
            task.state &&
            typeof task.state.complete === "boolean" &&
            typeof task.state.notComplete === "boolean" &&
            typeof task.description === "string"
        )
    );
  }
}

// Экспортируем экземпляр сервиса
export const dataService = new DataService();
