export interface Doctor {
  name: string;
}

export interface Task {
  number: number;
  label: string;
  status: {
    complete: boolean;
    notComplete: boolean;
  };
  description: string;
}

export interface Block {
  label: string;
  tasks: Task[];
}
export interface Meta {
  blocks: Block[];
  doctors: Doctor[];
}
export interface Store {
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
