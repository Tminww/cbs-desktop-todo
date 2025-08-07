import { app } from "electron";
import path from "path";
import * as fs from "fs/promises";
import initial from "./initial";

const dataDir = path.join(app.getPath("userData"), "states");
const configPath = path.join(dataDir, "state-initial.json");

export interface Config {
  [key: string]: any;
}

// Функция для создания и чтения конфига
export async function ensureConfigFile(): Promise<Config | null> {
  try {
    // Убедись, что папка существует
    await fs.mkdir(dataDir, { recursive: true });

    // Проверим, есть ли файл
    try {
      const raw = await fs.readFile(configPath, "utf8");
      const parsed = JSON.parse(raw);
      console.log("✅ Конфиг найден:", parsed);
      return parsed;
    } catch (readErr) {
      console.log("⚠ Конфиг не найден, создаем новый...");

      const defaultConfig = { ...initial };
      await fs.writeFile(
        configPath,
        JSON.stringify(defaultConfig, null, 2),
        "utf8"
      );
      return defaultConfig;
    }
  } catch (err) {
    console.error("❌ Ошибка при работе с конфигом:", err);
    return null;
  }
}
