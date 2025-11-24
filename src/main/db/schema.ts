// src/main/db/schema.ts
import { Database } from 'sqlite3';
import path from 'path';
import { app } from 'electron';

const dataDir = app.getPath('userData');
const dbPath = path.join(dataDir, 'app.db');

export function initializeDatabase(): Database {
  const db = new Database(dbPath);
  
  // Включаем foreign keys
  db.run("PRAGMA foreign_keys = ON;", (err) => {
  if (err) console.error("Failed to enable foreign keys:", err);
});
  
  // Временная таблица врачей
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
      valid_to DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_doctors_valid_period 
    ON doctors(valid_from, valid_to);
  `);

  // Временная таблица блоков задач
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      display_order INTEGER NOT NULL,
      valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
      valid_to DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_blocks_valid_period 
    ON task_blocks(valid_from, valid_to);
    
    CREATE INDEX IF NOT EXISTS idx_blocks_order 
    ON task_blocks(display_order);
  `);

  // Временная таблица задач
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block_id INTEGER NOT NULL,
      task_number INTEGER NOT NULL,
      label TEXT NOT NULL,
      valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
      valid_to DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (block_id) REFERENCES task_blocks(id) ON DELETE CASCADE,
      UNIQUE(block_id, task_number, valid_from)
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_block_valid 
    ON tasks(block_id, valid_from, valid_to);
  `);

  // Таблица отчетов (факты заполнения)
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_date DATE NOT NULL,
      doctor_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      UNIQUE(report_date, doctor_id)
    );

    CREATE INDEX IF NOT EXISTS idx_reports_date_doctor 
    ON reports(report_date, doctor_id);
  `);

  // Таблица результатов задач в отчетах
  db.exec(`
    CREATE TABLE IF NOT EXISTS report_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      task_id INTEGER NOT NULL,
      is_complete BOOLEAN DEFAULT 0,
      is_not_complete BOOLEAN DEFAULT 0,
      description TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      UNIQUE(report_id, task_id)
    );

    CREATE INDEX IF NOT EXISTS idx_report_tasks_report 
    ON report_tasks(report_id);
  `);

  // Таблица конфигурации (название подразделения и т.д.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

export { Database };