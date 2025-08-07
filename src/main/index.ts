import { app, BrowserWindow } from "electron";
import { ensureConfigFile } from "./config";
import { createWindow, setupSecurityHeaders } from "./window";
import { registerHandlers } from "./handlers";

console.log("App path:", __dirname);

app.whenReady().then(async () => {
  const config = await ensureConfigFile();
  console.log("🛠 Загруженный конфиг:", config);

  // Создаем окно
  createWindow();

  // Настраиваем безопасность
  setupSecurityHeaders();

  // Регистрируем IPC handlers
  registerHandlers();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
