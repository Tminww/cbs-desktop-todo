import { contextBridge, ipcRenderer } from "electron";

// Типы для API
export interface ApiResponse<T = any> {
  message: string;
  status: "success" | "error";
  [key: string]: any;
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

// Безопасно экспонируем API в renderer процесс
contextBridge.exposeInMainWorld("backend", {
  // Тестовый метод
  sendPing: (arg: any): Promise<string> => ipcRenderer.invoke("send-ping", arg),

  // Сохранение файла врача
  saveFile: (args: SaveFileArgs): Promise<ApiResponse> =>
    ipcRenderer.invoke("save-file", args),

  // Открытие файла врача или конфигурации
  openFile: (args: OpenFileArgs): Promise<ApiResponse & { content?: string }> =>
    ipcRenderer.invoke("open-file", args),

  // Получение списка врачей по дате
  getDoctorsByDate: (
    args: GetDoctorsByDateArgs
  ): Promise<ApiResponse & { doctors: string[] }> =>
    ipcRenderer.invoke("get-doctors-by-date", args),

  // Получение конфигурации
  getConfig: (): Promise<ApiResponse & { content?: string }> =>
    ipcRenderer.invoke("get-config"),

  // Обновление конфигурации
  updateConfig: (args: UpdateConfigArgs): Promise<ApiResponse> =>
    ipcRenderer.invoke("update-config", args),

  // Получение текущей даты
  getCurrentDate: (): Promise<ApiResponse & { date?: string }> =>
    ipcRenderer.invoke("get-current-date"),
});
