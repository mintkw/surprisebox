const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('dataStorage', {
  read: () => ipcRenderer.invoke('data-storage:read'),
  writeCacheToStorage: (texts) => ipcRenderer.invoke('data-storage:write-cache', texts)
})