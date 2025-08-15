import { app } from "electron";
import path from "path";
import * as fs from "fs/promises";
import { store, Store } from "./config";

const dataDir = app.getPath("userData");
const storePath = path.join(dataDir, "store.json");
export interface Doctor {
  name: string;
}

export interface Task {
  number: number;
  label: string;
  status: {
    complete: boolean;
    notComplete: boolean;
  };
  description: string;
}

export interface Block {
  label: string;
  tasks: Task[];
}
export interface Meta {
  blocks: Block[];
  doctors: Doctor[];
}
export interface Store {
  days?: {
    [date: string]: {
      meta: Meta;
      [doctor: string]: {
        blocks: Block[];
      };
    };
  };
  meta: Meta;
}

/**
 * Класс для управления хранилищем приложения
 */
class AppStore {
  public store: Store;

  constructor() {
    this.store = this.ensureStoreFile();
  }

  // Методы для работы с настройками приложения
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
  // async get(key: string) {
  //   let keys = key.split(".");

  //   let state = this.store;
  //   for (key of keys) {
  //     state = state[key];
  //   }
  //   return state;
  // }
  // async set(key: string, value: any) {
  //   let keys = key.split(".");

  //   let state = this.store;
  //   for (key of keys) {
  //     state = state[key];
  //   }
  //   state[]
  // }
  // async has(key: string) {}
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
        JSON.stringify(defaultConfig, null, 0),
        "utf8"
      );

      console.log("✅ Создан новый конфигурационный файл");
      return defaultConfig;
    }
  }
  async updateStoreFile() {
    await fs.writeFile(storePath, JSON.stringify(this.store, null, 0), "utf8");
  }
}

export const appStore = new AppStore();
