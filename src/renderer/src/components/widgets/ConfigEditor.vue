<!-- src/renderer/src/components/widgets/ConfigEditor.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@renderer/api';
import { deleteProxy } from '@renderer/utils';
import { useConfirm } from '@renderer/composables/useConfirm';
import { toast } from 'vue-sonner';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import Toolbar from 'primevue/toolbar';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputGroup from 'primevue/inputgroup';

const emit = defineEmits<{
  updateTitle: [newTitle: string];
}>();

const { confirm } = useConfirm();

const config = ref<Meta>({
  doctors: [],
  blocks: []
});

const title = ref('');
const isLoading = ref(false);

const showAddDoctor = ref(false);
const showAddBlock = ref(false);
const showAddTask = ref(false);

const newDoctorName = ref('');
const newBlockLabel = ref('');
const newTaskLabel = ref('');
const selectedBlockForTask = ref<number | null>(null);

onMounted(async () => {
  await loadConfig();
  title.value = await api.getTitle();
});

const loadConfig = async () => {
  isLoading.value = true;
  try {
    config.value = await api.getMeta();
  } catch (error) {
    console.error('Ошибка загрузки конфигурации:', error);
    toast.error('Ошибка загрузки конфигурации');
  } finally {
    isLoading.value = false;
  }
};

const saveConfig = async () => {
  isLoading.value = true;
  try {
    await api.setTitle(title.value);
    emit('updateTitle', title.value);

    const configToSave = deleteProxy(config.value);
    await api.setMeta(configToSave);

    toast.success('Конфигурация сохранена');
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    toast.error('Ошибка сохранения конфигурации');
  } finally {
    isLoading.value = false;
  }
};

const addDoctor = async () => {
  if (!newDoctorName.value.trim()) {
    toast.error('Введите имя врача');
    return;
  }

  if (config.value.doctors.some(d => d.name === newDoctorName.value.trim())) {
    toast.error('Врач с таким именем уже существует');
    return;
  }

  config.value.doctors.push({ name: newDoctorName.value.trim() });
  newDoctorName.value = '';
  showAddDoctor.value = false;
  toast.success('Врач добавлен');
};

const removeDoctor = async (index: number) => {
  if (await confirm('Удалить этого врача?')) {
    config.value.doctors.splice(index, 1);
    toast.success('Врач удален');
  }
};

const addBlock = async () => {
  if (!newBlockLabel.value.trim()) {
    toast.error('Введите название блока');
    return;
  }

  config.value.blocks.push({
    label: newBlockLabel.value.trim(),
    tasks: []
  });
  newBlockLabel.value = '';
  showAddBlock.value = false;
  toast.success('Блок добавлен');
};

const removeBlock = async (index: number) => {
  if (await confirm('Удалить блок и все его задачи?')) {
    config.value.blocks.splice(index, 1);
    toast.success('Блок удален');
  }
};

const moveBlockUp = (index: number) => {
  if (index > 0) {
    const block = config.value.blocks.splice(index, 1)[0];
    config.value.blocks.splice(index - 1, 0, block);
  }
};

const moveBlockDown = (index: number) => {
  if (index < config.value.blocks.length - 1) {
    const block = config.value.blocks.splice(index, 1)[0];
    config.value.blocks.splice(index + 1, 0, block);
  }
};

const addTask = async (blockIndex: number) => {
  if (!newTaskLabel.value.trim()) {
    toast.error('Введите описание задачи');
    return;
  }

  const block = config.value.blocks[blockIndex];
  const nextNumber = block.tasks.length > 0
    ? Math.max(...block.tasks.map(t => t.number)) + 1
    : 1;

  block.tasks.push({
    number: nextNumber,
    label: newTaskLabel.value.trim(),
    status: { complete: false, notComplete: false },
    description: ''
  });

  newTaskLabel.value = '';
  showAddTask.value = false;
  selectedBlockForTask.value = null;
  toast.success('Задача добавлена');
};

const removeTask = async (blockIndex: number, taskIndex: number) => {
  if (await confirm('Удалить эту задачу?')) {
    config.value.blocks[blockIndex].tasks.splice(taskIndex, 1);
    config.value.blocks[blockIndex].tasks.forEach((task, index) => {
      task.number = index + 1;
    });
    toast.success('Задача удалена');
  }
};

const moveTaskUp = (blockIndex: number, taskIndex: number) => {
  const block = config.value.blocks[blockIndex];
  if (taskIndex > 0) {
    const task = block.tasks.splice(taskIndex, 1)[0];
    block.tasks.splice(taskIndex - 1, 0, task);
    block.tasks.forEach((t, index) => {
      t.number = index + 1;
    });
  }
};

const moveTaskDown = (blockIndex: number, taskIndex: number) => {
  const block = config.value.blocks[blockIndex];
  if (taskIndex < block.tasks.length - 1) {
    const task = block.tasks.splice(taskIndex, 1)[0];
    block.tasks.splice(taskIndex + 1, 0, task);
    block.tasks.forEach((t, index) => {
      t.number = index + 1;
    });
  }
};
</script>

<template>
  <div class="config-editor">
    <Toolbar class="toolbar">
      <template #start>
        <h2>Редактор конфигурации</h2>
      </template>
      <template #end>
        <Button icon="pi pi-save" label="Сохранить" @click="saveConfig" :loading="isLoading" />
      </template>
    </Toolbar>

    <!-- Название подразделения -->
    <Card class="config-section">
      <template #title>Подразделение</template>
      <InputGroup>
        <InputText v-model="title" placeholder="Введите название подразделения" />
      </InputGroup>
    </Card>

    <!-- Врачи -->
    <Card class="config-section">
      <template #title>Управление врачами</template>
      <template #subtitle>{{ config.doctors.length }} врачей</template>

      <div class="section-controls">
        <Button icon="pi pi-plus" label="Добавить врача" @click="showAddDoctor = true" severity="success" />
      </div>

      <DataTable v-if="config.doctors.length > 0" :value="config.doctors" striped-rows class="data-table">
        <Column field="name" header="ФИО врача" />
        <Column header="Действия" style="width: 150px">
          <template #body="slotProps">
            <Button icon="pi pi-trash" rounded text severity="danger"
              @click="removeDoctor(config.doctors.indexOf(slotProps.data))" />
          </template>
        </Column>
      </DataTable>

      <div v-else class="empty-state">
        <p>Нет добавленных врачей</p>
      </div>
    </Card>

    <!-- Блоки задач -->
    <Card class="config-section">
      <template #title>Управление блоками задач</template>
      <template #subtitle>{{ config.blocks.length }} блоков</template>

      <div class="section-controls">
        <Button icon="pi pi-plus" label="Добавить блок" @click="showAddBlock = true" severity="success" />
      </div>

      <div v-if="config.blocks.length > 0" class="blocks-list">
        <Card v-for="(block, blockIndex) in config.blocks" :key="blockIndex" class="block-card">
          <template #title>
            <div class="block-title-wrapper">
              <span class="block-number">{{ blockIndex + 1 }}</span>
              <span>{{ block.label }}</span>
            </div>
          </template>
          <template #subtitle>{{ block.tasks.length }} задач</template>

          <div class="block-actions">
            <Button icon="pi pi-arrow-up" rounded text @click="moveBlockUp(blockIndex)" :disabled="blockIndex === 0" />
            <Button icon="pi pi-arrow-down" rounded text @click="moveBlockDown(blockIndex)"
              :disabled="blockIndex === config.blocks.length - 1" />
            <Button icon="pi pi-plus" rounded text severity="success"
              @click="selectedBlockForTask = blockIndex; showAddTask = true" />
            <Button icon="pi pi-trash" rounded text severity="danger" @click="removeBlock(blockIndex)" />
          </div>

          <!-- Задачи блока -->
          <div class="tasks-section">
            <DataTable :value="block.tasks" striped-rows class="data-table">
              <Column field="number" header="№" style="width: 50px" />
              <Column field="label" header="Описание" />
              <Column header="Действия" style="width: 120px">
                <template #body="slotProps">
                  <div class="action-buttons">
                    <Button icon="pi pi-arrow-up" text rounded
                      @click="moveTaskUp(blockIndex, block.tasks.indexOf(slotProps.data))"
                      :disabled="block.tasks.indexOf(slotProps.data) === 0" />
                    <Button icon="pi pi-arrow-down" text rounded
                      @click="moveTaskDown(blockIndex, block.tasks.indexOf(slotProps.data))"
                      :disabled="block.tasks.indexOf(slotProps.data) === block.tasks.length - 1" />
                    <Button icon="pi pi-trash" text rounded severity="danger"
                      @click="removeTask(blockIndex, block.tasks.indexOf(slotProps.data))" />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>Нет добавленных блоков</p>
      </div>
    </Card>

    <!-- Диалог добавления врача -->
    <Dialog v-model:visible="showAddDoctor" header="Добавить врача" :modal="true" class="dialog-sm">
      <InputGroup class="dialog-input">
        <InputText v-model="newDoctorName" placeholder="ФИО врача" @keyup.enter="addDoctor" />
        <Button icon="pi pi-check" @click="addDoctor" />
      </InputGroup>
    </Dialog>

    <!-- Диалог добавления блока -->
    <Dialog v-model:visible="showAddBlock" header="Добавить блок" :modal="true" class="dialog-sm">
      <InputGroup class="dialog-input">
        <InputText v-model="newBlockLabel" placeholder="Название блока" @keyup.enter="addBlock" />
        <Button icon="pi pi-check" @click="addBlock" />
      </InputGroup>
    </Dialog>

    <!-- Диалог добавления задачи -->
    <Dialog v-model:visible="showAddTask" header="Добавить задачу" :modal="true" class="dialog-sm">
      <InputGroup class="dialog-input">
        <InputText v-model="newTaskLabel" placeholder="Описание задачи" @keyup.enter="addTask(selectedBlockForTask)" />
        <Button icon="pi pi-check" @click="addTask(selectedBlockForTask)" />
      </InputGroup>
    </Dialog>
  </div>
</template>

<style scoped>
.config-editor {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.toolbar {
  margin-bottom: 30px;
}

.toolbar h2 {
  margin: 0;
  font-size: 24px;
  color: var(--text-color);
}

.config-section {
  margin-bottom: 24px;
}

:deep(.p-card-title) {
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 600;
}

.section-controls {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}

.data-table {
  width: 100%;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: var(--surface-ground);
  color: var(--text-color);
  font-weight: 600;
}

.blocks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.block-card {
  border-left: 4px solid var(--primary-color);
}

.block-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.block-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 12px;
}

.block-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.tasks-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-color-secondary);
  font-style: italic;
}

.dialog-sm {
  width: 90vw;
  max-width: 400px;
}

.dialog-input {
  display: flex;
  gap: 8px;
}

:deep(.p-inputtext) {
  flex: 1;
}

@media (max-width: 768px) {
  .config-editor {
    padding: 12px;
  }

  .blocks-list {
    gap: 12px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>