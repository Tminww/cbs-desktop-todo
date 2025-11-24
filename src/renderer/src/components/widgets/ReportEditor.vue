<!-- src/renderer/src/components/widgets/ReportEditor.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { api } from '@renderer/api';
import { deleteProxy } from '@renderer/utils';
import { useConfirm } from '@renderer/composables/useConfirm';
import { toast } from 'vue-sonner';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';
import InputTextarea from 'primevue/textarea';
import Card from 'primevue/card';
import Toolbar from 'primevue/toolbar';
import InputSwitch from 'primevue/inputswitch';

const { confirm } = useConfirm();

const currentBlocks = ref<Block[]>([]);
let currentDate = new Date().toISOString().split('T')[0];
const selectedDate = ref(new Date());
const selectedDoctor = ref<Doctor | null>(null);
const availableDoctors = ref<Doctor[]>([]);
const isReadonly = ref(false);
const selectAllComplete = ref(false);

onMounted(async () => {
  currentDate = await api.getCurrentDate();
  selectedDate.value = new Date(currentDate);
  await loadMetaForSelectedDate();
});

const loadMetaForSelectedDate = async () => {
  const dateStr = selectedDate.value.toISOString().split('T')[0];
  const doctors = await api.getDoctorsDateMeta(dateStr);
  const blocks = await api.getBlocksDateMeta(dateStr);

  availableDoctors.value = doctors.length === 0 ? await api.getDoctorsMeta() : doctors;
  currentBlocks.value = blocks.length === 0 ? await api.getBlocksMeta() : blocks;

  selectedDoctor.value = null;
  isReadonly.value = dateStr !== currentDate;
};

watch(selectedDoctor, async (newDoctor) => {
  if (!newDoctor) return;

  const dateStr = selectedDate.value.toISOString().split('T')[0];
  const report = await api.getReport(dateStr, newDoctor.id);

  if (report) {
    currentBlocks.value = report.blocks;
  } else {
    const blocks = await api.getBlocksDateMeta(dateStr);
    currentBlocks.value = blocks.length === 0 ? await api.getBlocksMeta() : blocks;
  }
});

const saveReport = async () => {
  if (!selectedDoctor.value) {
    toast.error('Выберите врача');
    return;
  }

  try {
    const dateStr = selectedDate.value.toISOString().split('T')[0];
    await api.saveReport(dateStr, selectedDoctor.value.id, deleteProxy(currentBlocks.value));
    toast.success('Отчет сохранен');
  } catch (error) {
    toast.error('Ошибка сохранения');
    console.error(error);
  }
};

const checkAllComplete = () => {
  currentBlocks.value.forEach(block => {
    block.tasks.forEach(task => {
      task.status.complete = !selectAllComplete.value;
      task.status.notComplete = false;
    });
  });
};

const restoreInitialState = async () => {
  if (await confirm('Вы действительно хотите очистить форму?')) {
    const dateStr = selectedDate.value.toISOString().split('T')[0];
    const blocks = await api.getBlocksDateMeta(dateStr);
    currentBlocks.value = blocks.length === 0 ? await api.getBlocksMeta() : blocks;
    await saveReport();
  }
};

const toCurrentDate = async () => {
  selectedDate.value = new Date(currentDate);
  await loadMetaForSelectedDate();
};

const isDoctorSelected = computed(() => selectedDoctor.value !== null);
</script>

<template>
  <div class="report-editor">
    <Toolbar class="toolbar">
      <template #start>
        <div class="toolbar-group">
          <label for="dateSelect" class="label">Дата:</label>
          <Calendar id="dateSelect" v-model="selectedDate" :max-date="new Date(currentDate)" date-format="yy-mm-dd"
            @date-select="loadMetaForSelectedDate" />
          <Button icon="pi pi-arrow-right" label="Сегодня" @click="toCurrentDate" severity="secondary" />
        </div>
      </template>
      <template #end>
        <div class="toolbar-group">
          <Button icon="pi pi-save" label="Сохранить" @click="saveReport" :disabled="!isDoctorSelected" />
          <Button icon="pi pi-refresh" label="Очистить" @click="restoreInitialState" severity="danger"
            :disabled="!isDoctorSelected" />
        </div>
      </template>
    </Toolbar>

    <Card class="doctor-selector">
      <template #title>Выбор врача</template>
      <div class="selector-content">
        <div class="dropdown-wrapper">
          <label for="doctorSelect" class="label">ФИО врача:</label>
          <Dropdown id="doctorSelect" v-model="selectedDoctor" :options="availableDoctors" option-label="name"
            placeholder="Выберите врача" class="w-full"
            :empty-message="availableDoctors.length === 0 ? 'Нет врачей' : 'Врач не найден'" />
        </div>

        <div class="controls">
          <div class="switch-group">
            <label for="readonlySwitch">Редактировать:</label>
            <InputSwitch id="readonlySwitch" v-model="isReadonly" :disabled="true" />
          </div>

          <div class="switch-group">
            <label for="selectAllSwitch">Выбрать все:</label>
            <InputSwitch id="selectAllSwitch" v-model="selectAllComplete" @change="checkAllComplete" />
          </div>
        </div>
      </div>
    </Card>

    <div v-if="isDoctorSelected" class="report-table">
      <template v-for="block in currentBlocks" :key="block.label">
        <div class="block-header">
          <h3>{{ block.label }}</h3>
        </div>

        <DataTable :value="block.tasks" responsive-layout="scroll" striped-rows class="block-table">
          <Column field="number" header="№" style="width: 60px" />
          <Column field="label" header="Наименование пункта проверки" />
          <Column header="Сделано" style="width: 100px">
            <template #body="slotProps">
              <Checkbox v-model="slotProps.data.status.complete" :binary="true" :disabled="!isReadonly" @change="
                slotProps.data.status.complete
                  ? (slotProps.data.status.notComplete = false)
                  : (slotProps.data.status.complete = true)
                " />
            </template>
          </Column>
          <Column header="Не сделано" style="width: 100px">
            <template #body="slotProps">
              <Checkbox v-model="slotProps.data.status.notComplete" :binary="true" :disabled="!isReadonly" @change="
                slotProps.data.status.notComplete
                  ? (slotProps.data.status.complete = false)
                  : (slotProps.data.status.notComplete = true)
                " />
            </template>
          </Column>
          <Column header="Примечание">
            <template #body="slotProps">
              <InputTextarea v-model="slotProps.data.description" :readonly="!isReadonly" :auto-resize="true"
                @change="saveReport" />
            </template>
          </Column>
        </DataTable>
      </template>

      <div v-if="currentBlocks.length === 0" class="empty-state">
        <p>Нет блоков задач для отображения</p>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Выберите врача для начала работы</p>
    </div>
  </div>
</template>

<style scoped>
.report-editor {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.toolbar {
  margin-bottom: 20px;
  border-radius: 8px;
}

.toolbar-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.label {
  font-weight: 500;
  color: var(--text-color);
}

:deep(.p-calendar) {
  width: 180px;
}

.doctor-selector {
  margin-bottom: 30px;
}

.selector-content {
  display: flex;
  gap: 30px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.dropdown-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 250px;
}

.controls {
  display: flex;
  gap: 30px;
}

.switch-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-table {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.block-header {
  margin-top: 24px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}

.block-header h3 {
  margin: 0;
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 600;
}

.block-table {
  margin-bottom: 20px;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: var(--surface-ground);
  color: var(--text-color);
  font-weight: 600;
  padding: 12px 8px;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 12px 8px;
  border-color: var(--border-color);
}

:deep(.p-inputtextarea) {
  min-height: 80px;
  resize: vertical;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-color-secondary);
  font-size: 16px;
}

@media (max-width: 768px) {
  .report-editor {
    padding: 12px;
  }

  .selector-content {
    flex-direction: column;
    gap: 16px;
  }

  .dropdown-wrapper {
    min-width: auto;
  }

  .controls {
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  .block-table {
    font-size: 12px;
  }
}
</style>