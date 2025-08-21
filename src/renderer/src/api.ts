// Обертка для безопасного вызова API с обработкой ошибок
export const api = {
  /**
   * Получить метаданные всех врачей
   */
  getDoctorsMeta: async (): Promise<Doctor[]> => {
    return await window.backend.getDoctorsMeta();
  },

  /**
   * Сохранить метаданные всех врачей
   * @param doctors - массив врачей
   */
  setDoctorsMeta: async (doctors: Doctor[]): Promise<void> => {
    return await window.backend.setDoctorsMeta(doctors);
  },

  /**
   * Получить метаданные всех блоков (например, временных слотов)
   */
  getBlocksMeta: async (): Promise<Block[]> => {
    return await window.backend.getBlocksMeta();
  },

  /**
   * Сохранить метаданные всех блоков
   * @param blocks - массив блоков
   */
  setBlocksMeta: async (blocks: Block[]): Promise<void> => {
    return await window.backend.setBlocksMeta(blocks);
  },

  /**
   * Получить метаданные врачей на определённую дату
   * @param date - строка даты в формате YYYY-MM-DD
   */
  getDoctorsDateMeta: async (date: string): Promise<Doctor[]> => {
    return await window.backend.getDoctorsDateMeta(date);
  },

  /**
   * Сохранить метаданные врачей на определённую дату
   * @param date - строка даты
   * @param doctors - массив врачей
   */
  setDoctorsDateMeta: async (
    date: string,
    doctors: Doctor[]
  ): Promise<void> => {
    return await window.backend.setDoctorsDateMeta(date, doctors);
  },

  /**
   * Получить метаданные блоков на определённую дату
   * @param date - строка даты
   */
  getBlocksDateMeta: async (date: string): Promise<Block[]> => {
    return await window.backend.getBlocksDateMeta(date);
  },

  /**
   * Сохранить метаданные блоков на определённую дату
   * @param date - строка даты
   * @param blocks - массив блоков
   */
  setBlocksDateMeta: async (date: string, blocks: Block[]): Promise<void> => {
    return await window.backend.setBlocksDateMeta(date, blocks);
  },

  /**
   * Получить блоки для конкретного врача на определённую дату
   * @param date - строка даты
   * @param doctorName - имя врача
   */
  getBlocksForDoctor: async (
    date: string,
    doctorName: string
  ): Promise<Block[]> => {
    return await window.backend.getBlocksForDoctor(date, doctorName);
  },

  /**
   * Сохранить блоки для конкретного врача на определённую дату
   * @param date - строка даты
   * @param doctorName - имя врача
   * @param blocks - массив блоков
   */
  setBlocksForDoctor: async (
    date: string,
    doctorName: string,
    blocks: Block[]
  ): Promise<void> => {
    return await window.backend.setBlocksForDoctor(date, doctorName, blocks);
  },

  /**
   * Получить общие метаданные приложения
   */
  getMeta: async (): Promise<Meta> => {
    return await window.backend.getMeta();
  },

  getDateMeta: async (date: string): Promise<Meta> => {
    const meta = {
      blocks: await window.backend.getBlocksDateMeta(date),
      doctors: await window.backend.getDoctorsDateMeta(date),
    };
    return meta;
  },

  /**
   * Сохранить общие метаданные приложения
   * @param meta - объект метаданных
   */
  setMeta: async (meta: Meta): Promise<Status> => {
    return await window.backend.setMeta(meta);
  },

  setDateMeta: async (date: string, meta: Meta): Promise<Status> => {
    const blocksResponse = await window.backend.setBlocksDateMeta(
      date,
      meta.blocks
    );
    const doctorsResponse = await window.backend.setDoctorsDateMeta(
      date,
      meta.doctors
    );
    console.log(blocksResponse.status, doctorsResponse.status);
    if (
      blocksResponse.status === "success" &&
      doctorsResponse.status === "success"
    ) {
      return { status: "success" };
    } else {
      return {
        status: "error",
        message: `${blocksResponse?.message} / ${doctorsResponse?.message}`,
      };
    }
  },

  /**
   * Печать отчёта на указанную дату для списка врачей
   * @param date - строка даты
   * @param doctors - массив врачей
   */
  printReport: async (date: string, doctors: Doctor[]): Promise<void> => {
    return await window.backend.printReport(date, doctors);
  },

  /**
   * Получить текущую дату (с бэкенда)
   */
  getCurrentDate: async (): Promise<string> => {
    return await window.backend.getCurrentDate();
  },

  clearStore: async () => {
    await window.backend.clearStore();
  },

  getTitle: async () => {
    return await window.backend.getTitle();
  },
  setTitle: async (title: string) => {
    return await window.backend.setTitle(title);
  },
};

export default api;
