import { app, BrowserWindow } from "electron";
import { ensureConfigFile } from "./store";
import { createWindow } from "./window";
import { setupSecurityHeaders } from "./security";
import { registerApi } from "./api";

console.log("App path:", __dirname);

app.whenReady().then(async () => {
  const config = await ensureConfigFile();
  console.log("🛠 Загруженный конфиг:", config);

  // Создаем окно
  createWindow();

  // Настраиваем безопасность
  setupSecurityHeaders();

  // Регистрируем IPC api
  registerApi();

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
