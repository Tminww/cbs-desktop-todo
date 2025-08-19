<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { api } from "../../api";
import { Doctor, Block, Meta, Task, Store } from "../../typings/index";
import { deleteProxy } from "../../utils";

// Реактивные данные
const config = ref<Meta>({
  doctors: [],
  blocks: [],
});

const actionStatus = ref<{ message: string; status: string } | null>(null);
const isLoading = ref(false);
const editingDoctor = ref(-1);
const editingBlock = ref(-1);
const editingTask = ref(-1);

// Новые элементы для добавления
const newDoctor = ref("");
const newBlockLabel = ref("");
const newTaskLabel = ref("");

// Статус цвет
const statusColor = computed(() => {
  if (!actionStatus.value) return "transparent";
  return actionStatus.value.status === "error" ? "#ff4444" : "#44ff44";
});

onMounted(async () => {
  await loadConfig();
});

// Загрузка конфигурации
const loadConfig = async (): Promise<void> => {
  isLoading.value = true;
  try {
    config.value = await api.getMeta();
    showStatus("Конфигурация загружена", "success");
  } catch (error) {
    console.error("Ошибка загрузки конфигурации:", error);
    showStatus("Ошибка загрузки конфигурации", "error");
  } finally {
    isLoading.value = false;
  }
};

// Сохранение конфигурации
const saveConfig = async (): Promise<void> => {
  if (!validateConfig()) {
    showStatus("Конфигурация содержит ошибки", "error");
    return;
  }

  isLoading.value = true;
  try {
    const response = await api.setMeta(deleteProxy(config.value));

    if (response === config.value) {
      showStatus("Конфигурация сохранена", "success");
    } else {
      console.log(response, deleteProxy(config.value));
      showStatus("При сохранении произошла ошибка", "error");
    }
  } catch (error) {
    console.error("Ошибка сохранения конфигурации:", error);
    showStatus("Ошибка сохранения конфигурации", "error");
  } finally {
    isLoading.value = false;
  }
};

// Валидация конфигурации
const validateConfig = (): boolean => {
  if (config.value.doctors.length === 0) {
    return false;
  }

  if (config.value.blocks.length === 0) {
    return false;
  }

  // Проверяем, что все врачи имеют имена
  if (config.value.doctors.some((doctor) => !doctor.name.trim())) {
    return false;
  }

  // Проверяем блоки и задачи
  for (const block of config.value.blocks) {
    if (!block.label.trim()) {
      return false;
    }

    if (block.tasks.length === 0) {
      return false;
    }

    for (const task of block.tasks) {
      if (!task.label.trim() || typeof task.number !== "number") {
        return false;
      }
    }
  }

  return true;
};

// Управление врачами
const addDoctor = (): void => {
  if (!newDoctor.value.trim()) {
    showStatus("Введите имя врача", "error");
    return;
  }

  if (
    config.value.doctors.some(
      (doctor) => doctor.name === newDoctor.value.trim()
    )
  ) {
    showStatus("Врач с таким именем уже существует", "error");
    return;
  }

  config.value.doctors.push({ name: newDoctor.value.trim() });
  newDoctor.value = "";
  showStatus("Врач добавлен", "success");
};

const removeDoctor = (index: number): void => {
  if (confirm("Вы уверены, что хотите удалить этого врача?")) {
    config.value.doctors.splice(index, 1);
    showStatus("Врач удален", "success");
  }
};

const startEditingDoctor = (index: number): void => {
  editingDoctor.value = index;
};

const stopEditingDoctor = (): void => {
  editingDoctor.value = -1;
};

// Управление блоками
const addBlock = (): void => {
  if (!newBlockLabel.value.trim()) {
    showStatus("Введите название блока", "error");
    return;
  }

  const newBlock: Block = {
    label: newBlockLabel.value.trim(),
    tasks: [],
  };

  config.value.blocks.push(newBlock);
  newBlockLabel.value = "";
  showStatus("Блок добавлен", "success");
};

const removeBlock = (index: number): void => {
  if (confirm("Вы уверены, что хотите удалить этот блок и все его задачи?")) {
    config.value.blocks.splice(index, 1);
    showStatus("Блок удален", "success");
  }
};

const moveBlockUp = (index: number): void => {
  if (index > 0) {
    const block = config.value.blocks.splice(index, 1)[0];
    config.value.blocks.splice(index - 1, 0, block);
  }
};

const moveBlockDown = (index: number): void => {
  if (index < config.value.blocks.length - 1) {
    const block = config.value.blocks.splice(index, 1)[0];
    config.value.blocks.splice(index + 1, 0, block);
  }
};

const startEditingBlock = (index: number): void => {
  editingBlock.value = index;
};

const stopEditingBlock = (): void => {
  editingBlock.value = -1;
};

// Управление задачами
const addTask = (blockIndex: number): void => {
  if (!newTaskLabel.value.trim()) {
    showStatus("Введите описание задачи", "error");
    return;
  }

  const block = config.value.blocks[blockIndex];
  const nextNumber =
    block.tasks.length > 0
      ? Math.max(...block.tasks.map((t) => t.number)) + 1
      : 1;

  const newTask: Task = {
    number: nextNumber,
    label: newTaskLabel.value.trim(),
    status: { complete: false, notComplete: false },
    description: "",
  };

  block.tasks.push(newTask);
  newTaskLabel.value = "";
  showStatus("Задача добавлена", "success");
};

const removeTask = (blockIndex: number, taskIndex: number): void => {
  if (confirm("Вы уверены, что хотите удалить эту задачу?")) {
    config.value.blocks[blockIndex].tasks.splice(taskIndex, 1);

    // Перенумеруем оставшиеся задачи
    config.value.blocks[blockIndex].tasks.forEach((task, index) => {
      task.number = index + 1;
    });

    showStatus("Задача удалена", "success");
  }
};

const moveTaskUp = (blockIndex: number, taskIndex: number): void => {
  if (taskIndex > 0) {
    const block = config.value.blocks[blockIndex];
    const task = block.tasks.splice(taskIndex, 1)[0];
    block.tasks.splice(taskIndex - 1, 0, task);

    // Перенумеруем задачи
    block.tasks.forEach((task, index) => {
      task.number = index + 1;
    });
  }
};

const moveTaskDown = (blockIndex: number, taskIndex: number): void => {
  const block = config.value.blocks[blockIndex];
  if (taskIndex < block.tasks.length - 1) {
    const task = block.tasks.splice(taskIndex, 1)[0];
    block.tasks.splice(taskIndex + 1, 0, task);

    // Перенумеруем задачи
    block.tasks.forEach((task, index) => {
      task.number = index + 1;
    });
  }
};

const stopEditingTask = (): void => {
  editingTask.value = -1;
};

// Утилиты
const showStatus = (message: string, status: string): void => {
  actionStatus.value = { message, status };
  setTimeout(() => {
    actionStatus.value = null;
  }, 3000);
};

const resetConfig = async (): void => {
  if (
    confirm(
      "Вы уверены, что хотите сбросить конфигурацию? Все изменения будут потеряны."
    )
  ) {
    await loadConfig();
  }
};

const exportConfig = (): void => {
  const dataStr = JSON.stringify(config.value, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `config-${
    new Date().toISOString().split("T")[0]
  }.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};
</script>

<template>
  <div class="config-editor">
    <div class="header">
      <h1>Редактор конфигурации</h1>
      <div class="header-actions">
        <button
          @click="exportConfig"
          class="btn btn-info"
          :disabled="isLoading"
        >
          Экспорт
        </button>
        <button
          @click="saveConfig"
          class="btn btn-primary"
          :disabled="isLoading"
        >
          {{ isLoading ? "Сохранение..." : "Сохранить" }}
        </button>
      </div>
    </div>

    <!-- Статус -->
    <div
      v-if="actionStatus"
      :style="{ backgroundColor: statusColor }"
      class="status-message"
    >
      {{ actionStatus.message }}
    </div>

    <div class="config-content">
      <!-- Секция врачей -->
      <div class="section">
        <h2>Врачи</h2>
        <div class="add-item">
          <input
            v-model="newDoctor"
            @keyup.enter="addDoctor"
            placeholder="Введите ФИО врача"
            class="input-field"
          />
          <button @click="addDoctor" class="btn btn-success">
            Добавить врача
          </button>
        </div>

        <div
          v-for="(doctor, index) in config.doctors"
          :key="index"
          class="item-row"
        >
          <div class="item-edit">
            <div class="task-number">{{ index + 1 }}</div>

            <input
              v-model="doctor.name"
              @keyup.enter="stopEditingDoctor"
              @blur="stopEditingDoctor"
              class="input-field"
            />
            <div class="block-actions">
              <button
                @click="removeDoctor(index)"
                class="btn btn-xs btn-danger"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Секция блоков -->
      <div class="section">
        <h2>Блоки задач</h2>
        <div class="add-item">
          <input
            v-model="newBlockLabel"
            @keyup.enter="addBlock"
            placeholder="Введите название блока"
            class="input-field"
          />
          <button @click="addBlock" class="btn btn-success">
            Добавить блок
          </button>
        </div>

        <div class="blocks-list">
          <div
            v-for="(block, blockIndex) in config.blocks"
            :key="blockIndex"
            class="block-item"
          >
            <!-- Заголовок блока -->
            <div class="block-header">
              <div class="block-edit">
                <input
                  v-model="block.label"
                  @keyup.enter="stopEditingBlock"
                  @blur="stopEditingBlock"
                  class="input-field block-input"
                />
                <div class="block-actions">
                  <button
                    @click="moveBlockUp(blockIndex)"
                    :disabled="blockIndex === 0"
                    class="btn btn-sm btn-secondary"
                  >
                    ↑
                  </button>
                  <button
                    @click="moveBlockDown(blockIndex)"
                    :disabled="blockIndex === config.blocks.length - 1"
                    class="btn btn-sm btn-secondary"
                  >
                    ↓
                  </button>

                  <button
                    @click="removeBlock(blockIndex)"
                    class="btn btn-sm btn-danger"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>

            <!-- Задачи блока -->
            <div class="tasks-section">
              <div class="add-task">
                <input
                  v-model="newTaskLabel"
                  @keyup.enter="addTask(blockIndex)"
                  placeholder="Введите описание задачи"
                  class="input-field"
                />
                <button
                  @click="addTask(blockIndex)"
                  class="btn btn-sm btn-success"
                >
                  Добавить задачу
                </button>
              </div>
              <div
                v-for="task in block.tasks"
                :key="task.number"
                class="item-row"
              >
                <div class="item-edit">
                  <div class="task-number">{{ task.number }}</div>

                  <input
                    v-model="task.label"
                    @keyup.enter="stopEditingTask"
                    @blur="stopEditingTask"
                    class="input-field"
                  />
                  <div class="task-actions">
                    <button
                      @click="moveTaskUp(blockIndex, task.number - 1)"
                      :disabled="task.number - 1 === 0"
                      class="btn btn-xs btn-secondary"
                    >
                      ↑
                    </button>
                    <button
                      @click="moveTaskDown(blockIndex, task.number - 1)"
                      :disabled="task.number - 1 === block.tasks.length - 1"
                      class="btn btn-xs btn-secondary"
                    >
                      ↓
                    </button>

                    <button
                      @click="removeTask(blockIndex, task.number - 1)"
                      class="btn btn-xs btn-danger"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-editor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.status-message {
  padding: 10px 15px;
  border-radius: 4px;
  color: white;
  margin-bottom: 20px;
  text-align: center;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section h2 {
  margin: 0 0 20px 0;
  color: #495057;
  border-bottom: 2px solid #f8f9fa;
  padding-bottom: 10px;
}

.add-item {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.input-field {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
}

.block-input {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
}

.task-input {
  flex: 1;
  font-size: 14px;
}

.item-row {
  margin-bottom: 8px;
}

.item-content,
.item-edit {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-text {
  font-size: 14px;
  color: #495057;
}

.item-actions,
.block-actions,
.task-actions {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

.block-item {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

.block-header {
  background: #f8f9fa;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.block-title,
.block-edit {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-title h3 {
  margin: 0;
  color: #495057;
}

.tasks-section {
  padding: 15px;
}

.add-task {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 8px;
  background: white;
}

.task-number {
  background: #007bff;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
  font-size: 14px;
}

.task-content,
.task-edit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.task-text {
  color: #495057;
  line-height: 1.4;
}

/* Кнопки */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #117a8b;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

/* Адаптивность */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .header-actions {
    justify-content: center;
  }

  .add-item,
  .add-task {
    flex-direction: column;
    align-items: stretch;
  }

  .item-content,
  .block-title,
  .task-content {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .item-actions,
  .block-actions,
  .task-actions {
    justify-content: center;
  }

  .task-item {
    flex-direction: column;
    align-items: stretch;
  }

  .task-number {
    align-self: flex-start;
  }
}
</style>
