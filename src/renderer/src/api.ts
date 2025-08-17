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

  /**
   * Сохранить общие метаданные приложения
   * @param meta - объект метаданных
   */
  setMeta: async (meta: Meta): Promise<void> => {
    return await window.backend.setMeta(meta);
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
};

export default api;
