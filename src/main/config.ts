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
export const store: Store = {
  days: {},
  meta: {
    blocks: [
      {
        label: "ПОМЕЩЕНИЯ ОТДЕЛЕНИЯ ПОСЛЕ ОКОНЧАНИЯ СМЕНЫ",
        tasks: [
          {
            number: 1,
            label: "БОКС ПРИЕМА ОБРАЗЦОВ",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 2,
            label: "БОКС ВРАЧЕБНО-АНАЛИТИЧЕСКИЙ",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 3,
            label: "БОКС АНАЛИТИЧЕСКИЙ",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 4,
            label: "БОКС ПОСЕВА ОБРАЗЦОВ",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 5,
            label: "АВТОКЛАВНЫЙ БОКС",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 6,
            label: "ТЕРМОСТАТНЫЙ БОКС",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 7,
            label: "БОКС ПОСЕВА ВОДЫ",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 8,
            label: "БОКС ПРИГОТОВЛЕНИЯ ПИТАТЕЛЬНЫХ СРЕД",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 9,
            label: "МОЕЧНЫЙ БОКС",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 10,
            label: "СТЕРИЛИЗАЦИОННЫЙ БОКС",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 11,
            label: "БОКС ПРИЕМА ПИЩИ",
            status: { complete: false, notComplete: false },
            description: "",
          },
        ],
      },

      {
        label: "РАСХОДНЫЕ МАТЕРИАЛЫ",
        tasks: [
          {
            number: 1,
            label:
              "КОНТРОЛЬ НАЛИЧИЯ РАСХОДНЫХ МАТЕРИАЛОВ (СРЕДЫ, БУТЫЛКИ, ТЕСТ-НАБОРЫ) ДЛЯ РАБОТЫ СЛЕДУЮЩЕЙ РАБОЧЕЙ СМЕНЫ",
            status: { complete: false, notComplete: false },
            description: "",
          },
        ],
      },
      {
        label: "ТРЕБОВАНИЯ БЕЗОПАСНОСТИ",
        tasks: [
          {
            number: 1,
            label:
              "КОНТРОЛЬ ОТКЛЮЧЕНИЯ ОБОРУДОВАНИЯ ИЗ РОЗЕТОК (ГДЕ НЕОБХОДИМО)",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 2,
            label: "КОНТРОЛЬ ОТКЛЮЧЕНИЯ СВЕТА В ПОМЕЩЕНИЯХ",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 3,
            label: "КОНТРОЛЬ ВКЛЮЧЕНИЯ УФ В ПОМЕЩЕНИЯХ",
            status: { complete: false, notComplete: false },
            description: "",
          },
          {
            number: 4,
            label: "ПРОВЕРКА ЗАКРЫТИЯ ДВЕРЕЙ ОТДЕЛЕНИЯ",
            status: { complete: false, notComplete: false },
            description: "",
          },
        ],
      },
    ],

    doctors: [
      { name: "Иванов Иван Иванович 1" },
      { name: "Иванов Иван Иванович 2" },
      { name: "Иванов Иван Иванович 3" },
      { name: "Иванов Иван Иванович 4" },
      { name: "Иванов Иван Иванович 5" },
      { name: "Иванов Иван Иванович 6" },
      { name: "Иванов Иван Иванович 7" },
    ],
  },
};
