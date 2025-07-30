// stores/tasks.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTasksStore = defineStore('tasks', () => {
  // State
  const currentTasks = ref([])
  const doctors = ref([])
  const baseTasks = ref([])
  const currentDate = ref(new Date().toISOString().split('T')[0])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const totalTasks = computed(() => {
    return currentTasks.value.reduce((total, block) => total + block.tasks.length, 0)
  })

  const completedTasks = computed(() => {
    return currentTasks.value.reduce((total, block) => {
      return total + block.tasks.filter((task) => task.state).length
    }, 0)
  })

  const progressPercentage = computed(() => {
    return totalTasks.value > 0 ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0
  })

  // Actions
  const loadBaseTasks = async () => {
    try {
      isLoading.value = true
      error.value = null

      // В реальном приложении здесь будет загрузка из файла через Electron API
      // const baseData = await window.electronAPI.readFile('tasks.json')

      // Для демонстрации используем моковые данные
      const mockBaseTasks = [
        {
          label: '1 block',
          tasks: [
            { label: 'Проверка пациента А', state: false, description: 'Общий осмотр' },
            { label: 'Анализы крови', state: false, description: 'Взятие анализов' },
            { label: 'Консультация', state: false, description: 'Разбор результатов' },
          ],
        },
        {
          label: '2 block',
          tasks: [
            { label: 'Процедуры', state: false, description: 'Выполнение назначений' },
            { label: 'Документооборот', state: false, description: 'Заполнение карт' },
          ],
        },
      ]

      baseTasks.value = mockBaseTasks
      initializeCurrentTasks()
    } catch (err) {
      error.value = 'Ошибка загрузки базовых задач: ' + err.message
    } finally {
      isLoading.value = false
    }
  }

  const loadDoctors = async () => {
    try {
      // Моковые данные врачей
      const mockDoctors = [
        { id: 1, name: 'Иванов И.И.', specialty: 'Терапевт' },
        { id: 2, name: 'Петрова А.С.', specialty: 'Кардиолог' },
        { id: 3, name: 'Сидоров В.М.', specialty: 'Хирург' },
      ]

      doctors.value = mockDoctors
    } catch (err) {
      error.value = 'Ошибка загрузки списка врачей: ' + err.message
    }
  }

  const initializeCurrentTasks = () => {
    // Создаем глубокую копию базовых задач для текущего состояния
    currentTasks.value = baseTasks.value.map((block) => ({
      ...block,
      tasks: block.tasks.map((task) => ({
        ...task,
        id: Math.random().toString(36).substr(2, 9), // Генерируем уникальный ID
        assignedDoctor: null,
        completedAt: null,
      })),
    }))
  }

  const toggleTaskState = (blockIndex, taskIndex) => {
    if (currentTasks.value[blockIndex]?.tasks[taskIndex]) {
      const task = currentTasks.value[blockIndex].tasks[taskIndex]
      task.state = !task.state
      task.completedAt = task.state ? new Date().toISOString() : null
    }
  }

  const assignDoctorToTask = (blockIndex, taskIndex, doctorId) => {
    if (currentTasks.value[blockIndex]?.tasks[taskIndex]) {
      currentTasks.value[blockIndex].tasks[taskIndex].assignedDoctor = doctorId
    }
  }

  const saveCurrentState = async (customDate = null) => {
    try {
      isLoading.value = true
      const saveDate = customDate || currentDate.value
      const filename = `tasks_${saveDate.replace(/-/g, '_')}.json`

      const dataToSave = {
        date: saveDate,
        tasks: currentTasks.value,
        metadata: {
          totalTasks: totalTasks.value,
          completedTasks: completedTasks.value,
          progressPercentage: progressPercentage.value,
          savedAt: new Date().toISOString(),
        },
      }

      // В реальном приложении здесь будет сохранение через Electron API
      // await window.electronAPI.saveFile(filename, JSON.stringify(dataToSave, null, 2))

      console.log(`Состояние сохранено в ${filename}`, dataToSave)
      return filename
    } catch (err) {
      error.value = 'Ошибка сохранения: ' + err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadStateFromDate = async (date) => {
    try {
      isLoading.value = true
      const filename = `tasks_${date.replace(/-/g, '_')}.json`

      // В реальном приложении здесь будет загрузка через Electron API
      // const savedData = await window.electronAPI.readFile(filename)

      // Для демонстрации используем localStorage
      const savedData = localStorage.getItem(filename)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        currentTasks.value = parsedData.tasks
        currentDate.value = parsedData.date
      } else {
        throw new Error('Файл не найден')
      }
    } catch (err) {
      error.value = 'Ошибка загрузки сохраненного состояния: ' + err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resetToBase = () => {
    initializeCurrentTasks()
    currentDate.value = new Date().toISOString().split('T')[0]
  }

  const addTask = (blockIndex, newTask) => {
    if (currentTasks.value[blockIndex]) {
      currentTasks.value[blockIndex].tasks.push({
        ...newTask,
        id: Math.random().toString(36).substr(2, 9),
        state: false,
        assignedDoctor: null,
        completedAt: null,
      })
    }
  }

  const removeTask = (blockIndex, taskIndex) => {
    if (currentTasks.value[blockIndex]?.tasks[taskIndex]) {
      currentTasks.value[blockIndex].tasks.splice(taskIndex, 1)
    }
  }

  return {
    // State
    currentTasks,
    doctors,
    baseTasks,
    currentDate,
    isLoading,
    error,

    // Getters
    totalTasks,
    completedTasks,
    progressPercentage,

    // Actions
    loadBaseTasks,
    loadDoctors,
    initializeCurrentTasks,
    toggleTaskState,
    assignDoctorToTask,
    saveCurrentState,
    loadStateFromDate,
    resetToBase,
    addTask,
    removeTask,
  }
})
