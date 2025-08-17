import { app } from "electron";
import path from "path";
import * as fs from "fs/promises";
import { Store } from "../types";
import { store } from "./config";

const dataDir = app.getPath("userData");
const storePath = path.join(dataDir, "store.json");

/**
 * Класс для управления хранилищем приложения
 */
class AppStore {
  private store: Store;

  constructor() {
    this.initializeStore();
  }

  private async initializeStore() {
    this.store = await this.ensureStoreFile();
  }

  /**
   * Обеспечивает существование директории данных
   */
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  /**
   * Получает значение по ключу с поддержкой точечной нотации
   * @param key Ключ (может содержать точки для вложенных объектов)
   * @param defaultValue Значение по умолчанию, если ключ не найден
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    const keys = key.split(".");
    let current: any = this.store;

    try {
      for (const k of keys) {
        if (current === null || current === undefined || !(k in current)) {
          return defaultValue as T;
        }
        current = current[k];
      }
      return current as T;
    } catch (error) {
      console.error(`Ошибка при получении значения по ключу "${key}":`, error);
      return defaultValue as T;
    }
  }

  /**
   * Устанавливает значение по ключу с поддержкой точечной нотации
   * @param key Ключ (может содержать точки для вложенных объектов)
   * @param value Значение для установки
   */
  async set(key: string, value: any): Promise<void> {
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let current: any = this.store;

    try {
      // Навигация к родительскому объекту
      for (const k of keys) {
        if (
          !(k in current) ||
          current[k] === null ||
          typeof current[k] !== "object"
        ) {
          current[k] = {};
        }
        current = current[k];
      }

      // Установка значения
      current[lastKey] = value;

      // Сохранение в файл
      await this.updateStoreFile();
      console.log(`✅ Установлено значение для ключа "${key}":`, value);
    } catch (error) {
      console.error(`Ошибка при установке значения для ключа "${key}":`, error);
      throw error;
    }
  }

  /**
   * Проверяет существование ключа
   * @param key Ключ для проверки
   */
  async has(key: string): Promise<boolean> {
    const keys = key.split(".");
    let current: any = this.store;

    try {
      for (const k of keys) {
        if (current === null || current === undefined || !(k in current)) {
          return false;
        }
        current = current[k];
      }
      return true;
    } catch (error) {
      console.error(`Ошибка при проверке существования ключа "${key}":`, error);
      return false;
    }
  }

  /**
   * Удаляет ключ из хранилища
   * @param key Ключ для удаления
   */
  async delete(key: string): Promise<boolean> {
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let current: any = this.store;

    try {
      // Навигация к родительскому объекту
      for (const k of keys) {
        if (
          !(k in current) ||
          current[k] === null ||
          typeof current[k] !== "object"
        ) {
          return false; // Ключ не существует
        }
        current = current[k];
      }

      if (!(lastKey in current)) {
        return false; // Ключ не существует
      }

      delete current[lastKey];
      await this.updateStoreFile();
      console.log(`✅ Удален ключ "${key}"`);
      return true;
    } catch (error) {
      console.error(`Ошибка при удалении ключа "${key}":`, error);
      return false;
    }
  }

  /**
   * Очищает всё хранилище
   */
  async clear(): Promise<void> {
    try {
      this.store = { ...store }; // Возвращаем к дефолтному состоянию
      await this.updateStoreFile();
      console.log("✅ Хранилище очищено");
    } catch (error) {
      console.error("Ошибка при очистке хранилища:", error);
      throw error;
    }
  }

  /**
   * Получает все ключи верхнего уровня
   */
  getKeys(): string[] {
    return Object.keys(this.store);
  }

  /**
   * Получает размер хранилища (количество ключей верхнего уровня)
   */
  getSize(): number {
    return Object.keys(this.store).length;
  }

  /**
   * Получает весь store как объект
   */
  getAll(): Store {
    return JSON.parse(JSON.stringify(this.store)); // Возвращаем копию
  }

  /**
   * Устанавливает несколько значений одновременно
   */
  async setMultiple(values: Record<string, any>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(values)) {
        await this.set(key, value);
      }
    } catch (error) {
      console.error("Ошибка при установке нескольких значений:", error);
      throw error;
    }
  }

  /**
   * Проверяет и создает конфигурационный файл
   */
  private async ensureStoreFile(): Promise<Store> {
    try {
      await this.ensureDataDir();
      const raw = await fs.readFile(storePath, "utf8");
      const parsed = JSON.parse(raw);
      console.log("✅ Конфиг найден:", parsed);
      return parsed;
    } catch (readErr) {
      console.log("Возникла ошибка: ", readErr);
      console.log("⚠ Конфиг не найден, создаем новый...");

      const defaultConfig = { ...store };
      await fs.writeFile(
        storePath,
        JSON.stringify(defaultConfig), // Без отступов
        "utf8"
      );

      console.log("✅ Создан новый конфигурационный файл");
      return defaultConfig;
    }
  }

  /**
   * Обновляет файл хранилища
   */
  async updateStoreFile(): Promise<void> {
    try {
      await fs.writeFile(
        storePath,
        JSON.stringify(this.store), // Без отступов для минимального размера
        "utf8"
      );
    } catch (error) {
      console.error("Ошибка при сохранении хранилища:", error);
      throw error;
    }
  }

  /**
   * Перезагружает хранилище из файла
   */
  async reload(): Promise<void> {
    try {
      const raw = await fs.readFile(storePath, "utf8");
      this.store = JSON.parse(raw);
      console.log("✅ Хранилище перезагружено");
    } catch (error) {
      console.error("Ошибка при перезагрузке хранилища:", error);
      throw error;
    }
  }
}

export const appStore = new AppStore();
