// src/main/handlers.ts
import { ipcMain } from 'electron';
import { DatabaseService } from './db/service';
import { Doctor, Block, Meta } from './types';

export function registerHandlers(dbService: DatabaseService): void {
  // ==================== DOCTORS ====================

  ipcMain.handle('get-doctors-meta', async (event): Promise<Doctor[]> => {
    try {
      return dbService.getAllDoctors();
    } catch (error) {
      console.error('Ошибка в get-doctors-meta:', error);
      return [];
    }
  });

  ipcMain.handle(
    'set-doctors-meta',
    async (event, doctors: Doctor[]): Promise<Doctor[]> => {
      try {
        doctors.forEach(doctor => {
          const existing = dbService.getAllDoctors().find(d => d.name === doctor.name);
          if (!existing) {
            dbService.addDoctor(doctor.name);
          }
        });
        return dbService.getAllDoctors();
      } catch (error) {
        console.error('Ошибка в set-doctors-meta:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    'add-doctor',
    async (event, name: string): Promise<Doctor[]> => {
      try {
        dbService.addDoctor(name);
        return dbService.getAllDoctors();
      } catch (error) {
        console.error('Ошибка в add-doctor:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    'remove-doctor',
    async (event, id: number): Promise<void> => {
      try {
        dbService.deactivateDoctor(id);
      } catch (error) {
        console.error('Ошибка в remove-doctor:', error);
        throw error;
      }
    }
  );

  // ==================== BLOCKS ====================

  ipcMain.handle('get-blocks-meta', async (event): Promise<Block[]> => {
    try {
      const date = new Date().toISOString().split('T')[0];
      return dbService.getBlocksByDate(date);
    } catch (error) {
      console.error('Ошибка в get-blocks-meta:', error);
      return [];
    }
  });

  ipcMain.handle(
    'set-blocks-meta',
    async (event, blocks: Block[]): Promise<Block[]> => {
      try {
        const date = new Date().toISOString().split('T')[0];
        blocks.forEach((block, index) => {
          dbService.addBlock(block.label, index, date);
          block.tasks.forEach(task => {
            const blockId = (blocks as any)[index]._id;
            dbService.addTask(blockId, task.number, task.label, date);
          });
        });
        return dbService.getBlocksByDate(date);
      } catch (error) {
        console.error('Ошибка в set-blocks-meta:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    'add-block',
    async (event, label: string): Promise<Block[]> => {
      try {
        const date = new Date().toISOString().split('T')[0];
        const blocks = dbService.getBlocksByDate(date);
        dbService.addBlock(label, blocks.length, date);
        return dbService.getBlocksByDate(date);
      } catch (error) {
        console.error('Ошибка в add-block:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    'remove-block',
    async (event, id: number): Promise<void> => {
      try {
        dbService.deactivateBlock(id);
      } catch (error) {
        console.error('Ошибка в remove-block:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    'add-task',
    async (event, blockId: number, label: string): Promise<void> => {
      try {
        const date = new Date().toISOString().split('T')[0];
        const blocks = dbService.getBlocksByDate(date);
        const block = blocks.find(b => (b as any).id === blockId);
        const nextNumber = block?.tasks.length ? Math.max(...block.tasks.map(t => t.number)) + 1 : 1;
        dbService.addTask(blockId, nextNumber, label, date);
      } catch (error) {
        console.error('Ошибка в add-task:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    'remove-task',
    async (event, id: number): Promise<void> => {
      try {
        dbService.deactivateTask(id);
      } catch (error) {
        console.error('Ошибка в remove-task:', error);
        throw error;
      }
    }
  );

  // ==================== REPORTS ====================

  ipcMain.handle(
    'get-report',
    async (event, date: string, doctorId: number): Promise<any> => {
      try {
        return dbService.getReportWithTasks(date, doctorId);
      } catch (error) {
        console.error('Ошибка в get-report:', error);
        return null;
      }
    }
  );

  ipcMain.handle(
    'save-report',
    async (event, date: string, doctorId: number, blocks: Block[]): Promise<void> => {
      try {
        const reportId = dbService.getOrCreateReport(date, doctorId);
        const allTasks = blocks.flatMap(block =>
          block.tasks.map(task => ({
            id: (task as any).id,
            status: task.status,
            description: task.description
          }))
        );
        dbService.saveReportTasks(reportId, allTasks);
      } catch (error) {
        console.error('Ошибка в save-report:', error);
        throw error;
      }
    }
  );

  // ==================== META ====================

  ipcMain.handle('get-meta', async (event): Promise<Meta> => {
    try {
      const date = new Date().toISOString().split('T')[0];
      return dbService.getMeta(date);
    } catch (error) {
      console.error('Ошибка в get-meta:', error);
      return { doctors: [], blocks: [] };
    }
  });

  ipcMain.handle('set-meta', async (event, meta: Meta): Promise<void> => {
    try {
      const date = new Date().toISOString().split('T')[0];
      dbService.setMeta(meta, date);
    } catch (error) {
      console.error('Ошибка в set-meta:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'get-doctors-date-meta',
    async (event, date: string): Promise<Doctor[]> => {
      try {
        return dbService.getDoctorsByDate(date);
      } catch (error) {
        console.error('Ошибка в get-doctors-date-meta:', error);
        return [];
      }
    }
  );

  ipcMain.handle(
    'get-blocks-date-meta',
    async (event, date: string): Promise<Block[]> => {
      try {
        return dbService.getBlocksByDate(date);
      } catch (error) {
        console.error('Ошибка в get-blocks-date-meta:', error);
        return [];
      }
    }
  );

  // ==================== CONFIG ====================

  ipcMain.handle('get-title', async (event): Promise<string> => {
    try {
      return dbService.getConfig('title', 'Подразделение');
    } catch (error) {
      console.error('Ошибка в get-title:', error);
      return 'Подразделение';
    }
  });

  ipcMain.handle('set-title', async (event, title: string): Promise<string> => {
    try {
      dbService.setConfig('title', title);
      return title;
    } catch (error) {
      console.error('Ошибка в set-title:', error);
      throw error;
    }
  });

  ipcMain.handle('get-current-date', async (event): Promise<string> => {
    return new Date().toISOString().split('T')[0];
  });
}