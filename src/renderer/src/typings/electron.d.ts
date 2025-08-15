/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  sendMessage: (message: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronApi;
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
}
