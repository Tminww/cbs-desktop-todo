import { contextBridge, ipcRenderer } from "electron";
import { Doctor, Block, Meta } from "../types";
// Безопасно экспонируем API в renderer процесс
contextBridge.exposeInMainWorld("backend", {
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

  clearStore: (): Promise<void> => ipcRenderer.invoke("clear-store"),
  getTitle: (): Promise<string> => ipcRenderer.invoke("get-title"),
  setTitle: (title: string) => ipcRenderer.invoke("set-title", title),
});
