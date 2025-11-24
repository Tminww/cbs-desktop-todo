// src/main/db/service.ts
import {Database} from 'sqlite3';
import { Doctor, Block, Task, Meta } from '../types';

export class DatabaseService {
  constructor(private db: Database) {}
  // ==================== DOCTORS ====================
  
  getDoctorsByDate(date: string): Doctor[] {
    const stmt = this.db.prepare(`
      SELECT id, name FROM doctors 
      WHERE valid_from <= ? AND (valid_to IS NULL OR valid_to >= ?)
      ORDER BY name
    `);
    return stmt.all(date, date) as Doctor[];
  }

  addDoctor(name: string, validFrom: string = new Date().toISOString().split('T')[0]): void {
    const stmt = this.db.prepare(`
      INSERT INTO doctors (name, valid_from)
      VALUES (?, ?)
    `);
    stmt.run(name, validFrom);
  }

  updateDoctor(id: number, name: string): void {
    const stmt = this.db.prepare(`
      UPDATE doctors SET name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(name, id);
  }

  deactivateDoctor(id: number, validTo: string = new Date().toISOString().split('T')[0]): void {
    const stmt = this.db.prepare(`
      UPDATE doctors SET valid_to = ? WHERE id = ?
    `);
    stmt.run(validTo, id);
  }

  getAllDoctors(): Doctor[] {
    const stmt = this.db.prepare(`
      SELECT id, name FROM doctors 
      WHERE valid_to IS NULL
      ORDER BY name
    `);
    return stmt.all() as Doctor[];
  }

  // ==================== TASK BLOCKS ====================

  getBlocksByDate(date: string): Block[] {
    const stmt = this.db.prepare(`
      SELECT tb.id, tb.label, tb.display_order
      FROM task_blocks tb
      WHERE tb.valid_from <= ? AND (tb.valid_to IS NULL OR tb.valid_to >= ?)
      ORDER BY tb.display_order
    `);
    
    const blocks = stmt.all(date, date) as Array<any>;
    
    return blocks.map(block => ({
      label: block.label,
      tasks: this.getTasksByBlock(block.id, date)
    }));
  }

  getTasksByBlock(blockId: number, date: string): Task[] {
    const stmt = this.db.prepare(`
      SELECT id, task_number as number, label, '' as description,
             json_object('complete', false, 'notComplete', false) as status
      FROM tasks
      WHERE block_id = ? 
        AND valid_from <= ? 
        AND (valid_to IS NULL OR valid_to >= ?)
      ORDER BY task_number
    `);
    
    return stmt.all(blockId, date, date) as Task[];
  }

  addBlock(label: string, displayOrder: number, validFrom: string = new Date().toISOString().split('T')[0]): number {
    const stmt = this.db.prepare(`
      INSERT INTO task_blocks (label, display_order, valid_from)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(label, displayOrder, validFrom);
    return result.lastInsertRowid as number;
  }

  updateBlock(id: number, label: string, displayOrder: number): void {
    const stmt = this.db.prepare(`
      UPDATE task_blocks 
      SET label = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(label, displayOrder, id);
  }

  deactivateBlock(id: number, validTo: string = new Date().toISOString().split('T')[0]): void {
    const stmt = this.db.prepare(`
      UPDATE task_blocks SET valid_to = ? WHERE id = ?
    `);
    stmt.run(validTo, id);
  }

  // ==================== TASKS ====================

  addTask(blockId: number, taskNumber: number, label: string, validFrom: string = new Date().toISOString().split('T')[0]): number {
    const stmt = this.db.prepare(`
      INSERT INTO tasks (block_id, task_number, label, valid_from)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(blockId, taskNumber, label, validFrom);
    return result.lastInsertRowid as number;
  }

  updateTask(id: number, label: string): void {
    const stmt = this.db.prepare(`
      UPDATE tasks SET label = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(label, id);
  }

  deactivateTask(id: number, validTo: string = new Date().toISOString().split('T')[0]): void {
    const stmt = this.db.prepare(`
      UPDATE tasks SET valid_to = ? WHERE id = ?
    `);
    stmt.run(validTo, id);
  }

  // ==================== REPORTS ====================

  getOrCreateReport(reportDate: string, doctorId: number): number {
    let stmt = this.db.prepare(`
      SELECT id FROM reports WHERE report_date = ? AND doctor_id = ?
    `);
    const existing = stmt.get(reportDate, doctorId) as any;
    
    if (existing) {
      return existing.id;
    }

    stmt = this.db.prepare(`
      INSERT INTO reports (report_date, doctor_id)
      VALUES (?, ?)
    `);
    const result = stmt.run(reportDate, doctorId);
    return result.lastInsertRowid as number;
  }

  getReportWithTasks(reportDate: string, doctorId: number): any {
    const reportStmt = this.db.prepare(`
      SELECT r.id, r.report_date, r.doctor_id
      FROM reports r
      WHERE r.report_date = ? AND r.doctor_id = ?
    `);
    const report = reportStmt.get(reportDate, doctorId) as any;
    
    if (!report) {
      return null;
    }

    const blocksStmt = this.db.prepare(`
      SELECT DISTINCT tb.id, tb.label, tb.display_order
      FROM task_blocks tb
      WHERE tb.valid_from <= ? AND (tb.valid_to IS NULL OR tb.valid_to >= ?)
      ORDER BY tb.display_order
    `);
    
    const blocks = blocksStmt.all(reportDate, reportDate) as Array<any>;

    const blocks_with_tasks = blocks.map(block => {
      const tasksStmt = this.db.prepare(`
        SELECT t.id, t.task_number as number, t.label,
               COALESCE(rt.is_complete, 0) as complete,
               COALESCE(rt.is_not_complete, 0) as notComplete,
               COALESCE(rt.description, '') as description
        FROM tasks t
        LEFT JOIN report_tasks rt ON t.id = rt.task_id AND rt.report_id = ?
        WHERE t.block_id = ?
          AND t.valid_from <= ?
          AND (t.valid_to IS NULL OR t.valid_to >= ?)
        ORDER BY t.task_number
      `);
      
      const tasks = tasksStmt.all(report.id, block.id, reportDate, reportDate) as Array<any>;
      
      return {
        label: block.label,
        tasks: tasks.map(t => ({
          number: t.number,
          label: t.label,
          status: {
            complete: !!t.complete,
            notComplete: !!t.notComplete
          },
          description: t.description
        }))
      };
    });

    return {
      ...report,
      blocks: blocks_with_tasks
    };
  }

  saveReportTasks(reportId: number, tasks: Array<any>): void {
    const stmt = this.db.prepare(`
      INSERT INTO report_tasks (report_id, task_id, is_complete, is_not_complete, description)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(report_id, task_id) DO UPDATE SET
        is_complete = excluded.is_complete,
        is_not_complete = excluded.is_not_complete,
        description = excluded.description,
        updated_at = CURRENT_TIMESTAMP
    `);

    tasks.forEach(task => {
      stmt.run(
        reportId,
        task.id,
        task.status.complete ? 1 : 0,
        task.status.notComplete ? 1 : 0,
        task.description
      );
    });
  }

  // ==================== CONFIG ====================

  getConfig(key: string, defaultValue: string = ''): string {
    const stmt = this.db.prepare(`
      SELECT value FROM config WHERE key = ?
    `);
    const result = stmt.get(key) as any;
    return result?.value || defaultValue;
  }

  setConfig(key: string, value: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO config (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(key, value);
  }

  // ==================== UTILITIES ====================

  getMeta(date: string): Meta {
    return {
      doctors: this.getDoctorsByDate(date),
      blocks: this.getBlocksByDate(date)
    };
  }

  setMeta(meta: Meta, date: string): void {
    // Обновляем врачей
    meta.doctors.forEach((doctor, index) => {
      const existing = this.db.prepare(`
        SELECT id FROM doctors WHERE name = ? AND valid_to IS NULL
      `).get(doctor.name) as any;

      if (!existing) {
        this.addDoctor(doctor.name, date);
      }
    });

    // Обновляем блоки и задачи
    meta.blocks.forEach((block, blockIndex) => {
      const existingBlock = this.db.prepare(`
        SELECT id FROM task_blocks WHERE label = ? AND valid_to IS NULL
      `).get(block.label) as any;

      let blockId: number;
      if (!existingBlock) {
        blockId = this.addBlock(block.label, blockIndex, date);
      } else {
        blockId = existingBlock.id;
      }

      block.tasks.forEach((task, taskIndex) => {
        const existingTask = this.db.prepare(`
          SELECT id FROM tasks WHERE block_id = ? AND task_number = ? AND valid_to IS NULL
        `).get(blockId, task.number) as any;

        if (!existingTask) {
          this.addTask(blockId, task.number, task.label, date);
        } else {
          this.updateTask(existingTask.id, task.label);
        }
      });
    });
  }

  close(): void {
    this.db.close();
  }
}