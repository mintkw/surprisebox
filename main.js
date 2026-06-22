const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron/main')
const path = require('node:path')
const fs = require('node:fs')

// Name of storage file
let data_json = path.join(app.getPath('userData'), "data.json");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 700,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  nativeTheme.themeSource = 'light';

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.handle('data-storage:read', () => {
  let data = null;
  try {
    data = fs.readFileSync(data_json, 'utf8');
  } catch (read_err) {
      console.error(read_err);
  }
  return data;
})

ipcMain.handle('data-storage:write-cache', (event, texts) => {
  // Overwrite the current storage space with the cache.
  let updated_content = {"texts": texts};
  updated_content = JSON.stringify(updated_content, null, 2);
  try {
      fs.writeFileSync(data_json, updated_content, 'utf8');
  } catch (err) {
      console.error(err);
  }
})