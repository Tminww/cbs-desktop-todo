const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('backend', {
  // Здесь можно добавить API для взаимодействия с главным процессом
  sendPing: (arg) => ipcRenderer.invoke('send-ping', arg),
  saveFile: (args) => ipcRenderer.invoke('save-file', args),
  openFile: (args) => ipcRenderer.invoke('open-file', args),
})
