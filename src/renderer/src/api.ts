// src/renderer/src/api.ts
export const api = {
  // ==================== DOCTORS ====================
  
  getDoctorsMeta: async (): Promise<Doctor[]> => {
    return await window.backend.getDoctorsMeta();
  },

  setDoctorsMeta: async (doctors: Doctor[]): Promise<Doctor[]> => {
    return await window.backend.setDoctorsMeta(doctors);
  },

  addDoctor: async (name: string): Promise<Doctor[]> => {
    return await window.backend.addDoctor(name);
  },

  removeDoctor: async (id: number): Promise<void> => {
    return await window.backend.removeDoctor(id);
  },

  // ==================== BLOCKS ====================

  getBlocksMeta: async (): Promise<Block[]> => {
    return await window.backend.getBlocksMeta();
  },

  setBlocksMeta: async (blocks: Block[]): Promise<Block[]> => {
    return await window.backend.setBlocksMeta(blocks);
  },

  addBlock: async (label: string): Promise<Block[]> => {
    return await window.backend.addBlock(label);
  },

  removeBlock: async (id: number): Promise<void> => {
    return await window.backend.removeBlock(id);
  },

  // ==================== TASKS ====================

  addTask: async (blockId: number, label: string): Promise<void> => {
    return await window.backend.addTask(blockId, label);
  },

  removeTask: async (id: number): Promise<void> => {
    return await window.backend.removeTask(id);
  },

  // ==================== REPORTS ====================

  getReport: async (date: string, doctorId: number): Promise<any> => {
    return await window.backend.getReport(date, doctorId);
  },

  saveReport: async (date: string, doctorId: number, blocks: Block[]): Promise<void> => {
    return await window.backend.saveReport(date, doctorId, blocks);
  },

  // ==================== META & CONFIG ====================

  getMeta: async (): Promise<Meta> => {
    return await window.backend.getMeta();
  },

  setMeta: async (meta: Meta): Promise<void> => {
    return await window.backend.setMeta(meta);
  },

  getDoctorsDateMeta: async (date: string): Promise<Doctor[]> => {
    return await window.backend.getDoctorsDateMeta(date);
  },

  getBlocksDateMeta: async (date: string): Promise<Block[]> => {
    return await window.backend.getBlocksDateMeta(date);
  },

  getTitle: async (): Promise<string> => {
    return await window.backend.getTitle();
  },

  setTitle: async (title: string): Promise<string> => {
    return await window.backend.setTitle(title);
  },

  getCurrentDate: async (): Promise<string> => {
    return await window.backend.getCurrentDate();
  }
};

export default api;