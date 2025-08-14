import { app } from "electron";
import path from "path";
import * as fs from "fs/promises";
import Store from "electron-store";
import config from "./config";

const dataDir = path.join(app.getPath("userData"), "states");
const configPath = path.join(dataDir, "state-initial.json");

export interface Config {
  [key: string]: any;
}

// Создаем экземпляр electron-store для настроек приложения
const appStore = new Store({
  name: "app-settings",
  defaults: {
    lastSelectedDoctor: "",
    autoSaveInterval: 30000,
    windowBounds: { width: 1200, height: 800 },
    theme: "light",
  },
});

// Создаем экземпляр для кэширования часто используемых данных
const cacheStore = new Store({
  name: "app-cache",
  defaults: {
    recentDates: [],
    recentDoctors: [],
  },
});

/**
 * Класс для управления хранилищем приложения
 */
export class AppStore {
  private appStore: Store;
  private cacheStore: Store;
  private dataDir: string;

  constructor() {
    this.appStore = appStore;
    this.cacheStore = cacheStore;
    this.dataDir = dataDir;
  }

  // Методы для работы с настройками приложения

  /**
   * Получает настройку приложения
   */
  getSetting<T>(key: string, defaultValue?: T): T {
    return this.appStore.get(key, defaultValue) as T;
  }

  /**
   * Устанавливает настройку приложения
   */
  setSetting(key: string, value: any): void {
    this.appStore.set(key, value);
  }

  /**
   * Получает последнего выбранного врача
   */
  getLastSelectedDoctor(): string {
    return this.getSetting("lastSelectedDoctor", "");
  }

  /**
   * Сохраняет последнего выбранного врача
   */
  setLastSelectedDoctor(doctorName: string): void {
    this.setSetting("lastSelectedDoctor", doctorName);

    // Также добавляем в список недавних врачей
    this.addRecentDoctor(doctorName);
  }

  /**
   * Получает интервал автосохранения
   */
  getAutoSaveInterval(): number {
    return this.getSetting("autoSaveInterval", 30000);
  }

  /**
   * Устанавливает интервал автосохранения
   */
  setAutoSaveInterval(interval: number): void {
    this.setSetting("autoSaveInterval", interval);
  }

  /**
   * Получает размеры окна
   */
  getWindowBounds(): { width: number; height: number } {
    return this.getSetting("windowBounds", { width: 1200, height: 800 });
  }

  /**
   * Сохраняет размеры окна
   */
  setWindowBounds(bounds: { width: number; height: number }): void {
    this.setSetting("windowBounds", bounds);
  }

  // Методы для работы с кэшем

  /**
   * Добавляет дату в список недавних
   */
  addRecentDate(date: string): void {
    const recentDates: string[] = this.cacheStore.get("recentDates", []);
    const filteredDates = recentDates.filter((d) => d !== date);

    // Добавляем в начало и ограничиваем до 10 элементов
    const updatedDates = [date, ...filteredDates].slice(0, 10);
    this.cacheStore.set("recentDates", updatedDates);
  }

  /**
   * Получает список недавних дат
   */
  getRecentDates(): string[] {
    return this.cacheStore.get("recentDates", []);
  }

  /**
   * Добавляет врача в список недавних
   */
  addRecentDoctor(doctorName: string): void {
    const recentDoctors: string[] = this.cacheStore.get("recentDoctors", []);
    const filteredDoctors = recentDoctors.filter((d) => d !== doctorName);

    // Добавляем в начало и ограничиваем до 10 элементов
    const updatedDoctors = [doctorName, ...filteredDoctors].slice(0, 10);
    this.cacheStore.set("recentDoctors", updatedDoctors);
  }

  /**
   * Получает список недавних врачей
   */
  getRecentDoctors(): string[] {
    return this.cacheStore.get("recentDoctors", []);
  }

  /**
   * Очищает кэш
   */
  clearCache(): void {
    this.cacheStore.clear();
  }

  // Методы для работы с файловой системой (унаследованы из старой реализации)

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
   * Проверяет и создает конфигурационный файл
   */
  async ensureConfigFile(): Promise<Config | null> {
    try {
      await this.ensureDataDir();

      try {
        const raw = await fs.readFile(configPath, "utf8");
        const parsed = JSON.parse(raw);
        console.log("✅ Конфиг найден:", parsed);
        return parsed;
      } catch (readErr) {
        console.log("⚠ Конфиг не найден, создаем новый...");

        const defaultConfig = { ...config };
        await fs.writeFile(
          configPath,
          JSON.stringify(defaultConfig, null, 2),
          "utf8"
        );

        console.log("✅ Создан новый конфигурационный файл");
        return defaultConfig;
      }
    } catch (err) {
      console.error("❌ Ошибка при работе с конфигом:", err);
      return null;
    }
  }

  /**
   * Получает статистику использования приложения
   */
  getUsageStats(): {
    totalSaves: number;
    totalDays: number;
    totalDoctors: number;
    lastUsed: string;
  } {
    return {
      totalSaves: this.getSetting("totalSaves", 0),
      totalDays: this.getSetting("totalDays", 0),
      totalDoctors: this.getSetting("totalDoctors", 0),
      lastUsed: this.getSetting("lastUsed", ""),
    };
  }

  /**
   * Обновляет статистику использования
   */
  updateUsageStats(
    stats: Partial<{
      totalSaves: number;
      totalDays: number;
      totalDoctors: number;
      lastUsed: string;
    }>
  ): void {
    const currentStats = this.getUsageStats();
    const updatedStats = { ...currentStats, ...stats };

    Object.keys(updatedStats).forEach((key) => {
      this.setSetting(key, updatedStats[key]);
    });
  }

  /**
   * Инкрементирует счетчик сохранений
   */
  incrementSaveCount(): void {
    const currentCount = this.getSetting("totalSaves", 0);
    this.setSetting("totalSaves", currentCount + 1);
    this.setSetting("lastUsed", new Date().toISOString());
  }

  /**
   * Обновляет счетчик уникальных дней
   */
  updateDayCount(date: string): void {
    const uniqueDays: string[] = this.getSetting("uniqueDays", []);
    if (!uniqueDays.includes(date)) {
      uniqueDays.push(date);
      this.setSetting("uniqueDays", uniqueDays);
      this.setSetting("totalDays", uniqueDays.length);
    }
  }

  /**
   * Обновляет счетчик уникальных врачей
   */
  updateDoctorCount(doctorName: string): void {
    const uniqueDoctors: string[] = this.getSetting("uniqueDoctors", []);
    if (!uniqueDoctors.includes(doctorName)) {
      uniqueDoctors.push(doctorName);
      this.setSetting("uniqueDoctors", uniqueDoctors);
      this.setSetting("totalDoctors", uniqueDoctors.length);
    }
  }

  /**
   * Экспортирует все настройки в JSON
   */
  exportSettings(): string {
    return JSON.stringify(this.appStore.store, null, 2);
  }
}
