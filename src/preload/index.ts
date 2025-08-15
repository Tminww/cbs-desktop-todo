import { contextBridge, ipcRenderer } from "electron";

interface Doctor {
  name: string;
}

interface Task {
  number: number;
  label: string;
  status: {
    complete: boolean;
    notComplete: boolean;
  };
  description: string;
}

interface Block {
  label: string;
  tasks: Task[];
}
interface Meta {
  blocks: Block[];
  doctors: Doctor[];
}
interface Store {
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

  //NEw API

  getDoctorsMeta: (): Promise<Doctor[]> =>
    ipcRenderer.invoke("get-doctors-meta"),
  setDoctorsMeta: (doctors: Doctor[]) =>
    ipcRenderer.invoke("set-doctors-meta", doctors),

  getBlocksMeta: (): Promise<Block[]> => ipcRenderer.invoke("get-blocks-meta"),
  setBlocksMeta: (blocks: Block[]) =>
    ipcRenderer.invoke("set-blocks-meta", blocks),

  getDoctorsDateMeta: (date: string): Promise<Doctor[]> =>
    ipcRenderer.invoke("get-doctors-date-meta", date),
  setDoctorsDateMeta: (date: string, doctors: Doctor[]) =>
    ipcRenderer.invoke("set-doctors-date-meta", date, doctors),

  getBlocksDateMeta: (date: string): Promise<Block[]> =>
    ipcRenderer.invoke("get-blocks-date-meta", date),
  setBlocksDateMeta: (date: string, blocks: Block[]) =>
    ipcRenderer.invoke("set-blocks-date-meta", date, blocks),

  getBlocksForDoctor: (date: string, doctorName: string): Promise<Block[]> =>
    ipcRenderer.invoke("get-blocks-for-doctor", date, doctorName),
  setBlocksForDoctor: (date: string, doctorName: string, blocks: Block[]) =>
    ipcRenderer.invoke("set-blocks-for-doctor", date, doctorName, blocks),

  getMeta: (): Promise<Meta> => ipcRenderer.invoke("get-meta"),
  setMeta: (meta: Meta) => ipcRenderer.invoke("set-meta", meta),

  printReport: (date: string, doctor: Doctor[]) =>
    ipcRenderer.invoke("print-report", date, doctor),

  getCurrentDate: (): Promise<string> => ipcRenderer.invoke("get-current-date"),
});
