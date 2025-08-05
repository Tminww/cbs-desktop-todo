import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Определите папку для сохранения данных
const dataDir = path.join(__dirname, 'states')

// Определяем режим разработки
// const isDev = import.meta.VITE_ENV === 'development'
const isDev = true
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173') // Vite dev server
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
  const template = [
    {
      label: 'Вид',
      submenu: [{ role: 'reload' }, { type: 'separator' }, { role: 'zoomin' }, { role: 'zoomout' }],
    },
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('send-ping', async (event, arg) => {
  console.log(arg)
  return 'pong'
})

ipcMain.handle('save-file', async (event, args) => {
  console.log(args)
  const fileName = `state-${args.date}.json`
  if (await save(fileName, args.content)) {
    return {
      message: 'Успешное сохранение',
      status: 'success',
    }
  } else {
    return {
      message: 'При сохранении произошла ошибка',
      status: 'error',
    }
  }
})

ipcMain.handle('open-file', async (event, args) => {
  console.log(args)
  const fileName = `state-${args.date}.json`
  let content = await load(fileName)
  if (content) {
    return {
      message: 'Успешная загрузка',
      status: 'success',
      content,
    }
  } else {
    return {
      message: 'При загрузке данных произошла ошибка',
      status: 'error',
    }
  }
})

const save = async (fileName, content) => {
  try {
    await ensureDataDir()

    const filePath = path.join(dataDir, fileName)
    await fs.writeFile(filePath, content)
    return true
  } catch {
    return false
  }
}

const load = async (fileName) => {
  try {
    const filePath = path.join(dataDir, fileName)
    const data = await fs.readFile(filePath, 'utf8')
    return data
  } catch {
    return false
  }
}

// Создайте папку если её нет
async function ensureDataDir() {
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}
