/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface Backend {
  setTitle(title: string): Promise<string>;
  getTitle(): Promise<string>;
  clearStore(): unknown;
  getCurrentDate(): string | PromiseLike<string>;
  printReport(date: string, doctors: Doctor[]): void | PromiseLike<void>;
  setMeta(meta: Meta): Status | PromiseLike<Status>;
  getMeta(): Meta | PromiseLike<Meta>;
  setBlocksForDoctor(
    date: string,
    doctorName: string,
    blocks: Block[]
  ): void | PromiseLike<void>;
  getBlocksForDoctor(
    date: string,
    doctorName: string
  ): Block[] | PromiseLike<Block[]>;
  setBlocksDateMeta(
    date: string,
    blocks: Block[]
  ): Status | PromiseLike<Status>;
  getBlocksDateMeta(date: string): Block[] | PromiseLike<Block[]>;
  setDoctorsDateMeta(
    date: string,
    doctors: Doctor[]
  ): Status | PromiseLike<Status>;
  setBlocksMeta(blocks: Block[]): void | PromiseLike<void>;
  getBlocksMeta(): Block[] | PromiseLike<Block[]>;
  setDoctorsMeta(doctors: Doctor[]): void | PromiseLike<void>;
  getDoctorsMeta(): Doctor[] | PromiseLike<Doctor[]>;
  getDoctorsDateMeta(date: string): Doctor[] | PromiseLike<Doctor[]>;
  sendMessage: (message: string) => void;
}

declare global {
  interface Window {
    backend: Backend;
  }
  interface Doctor {
    name: string;
  }

  interface Task {
    number: number;
    label: string;
    status: {
      complete: boolean;
      notComplete: boolean;
    };
    description: string;
  }

  interface Block {
    label: string;
    tasks: Task[];
  }
  interface Meta {
    blocks: Block[];
    doctors: Doctor[];
  }
  interface Store {
    days?: {
      [date: string]: {
        meta: Meta;
        [doctor: string]: {
          blocks: Block[];
        };
      };
    };
    meta: Meta;
  }
  interface Status {
    status: "error" | "success";
    message?: string;
  }
}
