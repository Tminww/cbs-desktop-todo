import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("backend", {
  sendPing: (arg) => ipcRenderer.invoke("send-ping", arg),
  saveFile: (args) => ipcRenderer.invoke("save-file", args),
  openFile: (args) => ipcRenderer.invoke("open-file", args),
  getDoctorsByDate: (args) => ipcRenderer.invoke("get-doctors-by-date", args),
});
