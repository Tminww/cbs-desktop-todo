// src/renderer/src/typings/electron.d.ts
export default interface Backend {
  // Doctors
  getDoctorsMeta(): Promise<Doctor[]>;
  setDoctorsMeta(doctors: Doctor[]): Promise<Doctor[]>;
  addDoctor(name: string): Promise<Doctor[]>;
  removeDoctor(id: number): Promise<void>;

  // Blocks
  getBlocksMeta(): Promise<Block[]>;
  setBlocksMeta(blocks: Block[]): Promise<Block[]>;
  addBlock(label: string): Promise<Block[]>;
  removeBlock(id: number): Promise<void>;

  // Tasks
  addTask(blockId: number, label: string): Promise<void>;
  removeTask(id: number): Promise<void>;

  // Reports
  getReport(date: string, doctorId: number): Promise<any>;
  saveReport(date: string, doctorId: number, blocks: Block[]): Promise<void>;

  // Meta & Config
  getMeta(): Promise<Meta>;
  setMeta(meta: Meta): Promise<void>;
  getDoctorsDateMeta(date: string): Promise<Doctor[]>;
  getBlocksDateMeta(date: string): Promise<Block[]>;
  getTitle(): Promise<string>;
  setTitle(title: string): Promise<string>;
  getCurrentDate(): Promise<string>;
}

declare global {
  interface Window {
    backend: Backend;
  }

  interface Doctor {
    id?: number;
    name: string;
  }

  interface Task {
    id?: number;
    number: number;
    label: string;
    status: {
      complete: boolean;
      notComplete: boolean;
    };
    description: string;
  }

  interface Block {
    id?: number;
    label: string;
    tasks: Task[];
  }

  interface Meta {
    blocks: Block[];
    doctors: Doctor[];
  }
}