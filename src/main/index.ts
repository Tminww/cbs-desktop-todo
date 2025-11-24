// src/main/index.ts
import { app, BrowserWindow } from 'electron';
import { createWindow } from './window';
import { setupSecurityHeaders } from './security';
import { registerHandlers } from './handlers';
import { initializeDatabase } from './db/schema';
import { DatabaseService } from './db/service';

let dbService: DatabaseService;

console.log('App path:', __dirname);

app.whenReady().then(async () => {
  // Инициализируем БД
  const db = initializeDatabase();
  dbService = new DatabaseService(db);

  // Создаем окно
  createWindow();

  // Настраиваем безопасность
  setupSecurityHeaders();

  // Регистрируем IPC api
  registerHandlers(dbService);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (dbService) {
    dbService.close();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (dbService) {
    dbService.close();
  }
});