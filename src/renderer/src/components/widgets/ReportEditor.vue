<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect, onUnmounted } from "vue";
import { api } from "../../api";
import { Doctor, Block } from "../../../../types";

const state = ref({});
let autoSaveInterval = null;

const currentBlocks = ref<Block[]>([]);
let currentDate = new Date().toISOString().split("T")[0];
const currentCheck = ref(false);
const selectedDate = ref(currentDate);
const selectedDoctor = ref("");
const availableDoctors = ref<Doctor[]>([]);
const actionStatus = ref("");
const isReadonly = computed(() => {
  return selectedDate.value !== currentDate;
});
onMounted(async () => {
  currentDate = await api.getCurrentDate();
  selectedDate.value = currentDate;

  availableDoctors.value = await api.getDoctorsDateMeta(selectedDate.value);
  currentBlocks.value = await api.getBlocksDateMeta(selectedDate.value);
  if (availableDoctors.value.length === 0 && currentBlocks.value.length === 0) {
    availableDoctors.value = await api.getDoctorsMeta();
    currentBlocks.value = await api.getBlocksMeta();
  }

  await api.setDoctorsDateMeta(
    selectedDate.value,
    deleteProxy(availableDoctors.value)
  );

  await api.setBlocksDateMeta(
    selectedDate.value,
    deleteProxy(currentBlocks.value)
  );
});

const deleteProxy = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};
const checkAllComplete = () => {
  console.log("i work", currentCheck.value);
  currentBlocks.value.forEach((block) => {
    block.tasks.forEach((task) => {
      task.status.complete = !currentCheck.value;
    });
  });
};

const statusColor = computed(() => {
  let color = "gray";
  if (actionStatus.value.status) {
    color = actionStatus.value.status === "error" ? "crimson" : "lightgreen";
  }
  console.log(color);
  return color;
});

// watch(
//   currentBlocks,
//   async (newBlocks) => {
//     if (newBlocks.length > 0) {
//       console.log("currentBlocks changes", newBlocks, availableDoctors.value);
//       const metaBlocks = await api.getBlocksMeta();
//       await api.setBlocksDateMeta(
//         currentDate.value,
//         JSON.parse(JSON.stringify(metaBlocks))
//       );
//       const metaDateBlocks = await api.getBlocksDateMeta(selectedDate.value);
//       if (
//         metaDateBlocks.length !== 0 &&
//         metaDateBlocks === currentBlocks.value
//       ) {
//         return;
//       }

//       await api.setBlocksForDoctor(
//         selectedDate.value,
//         selectedDoctor.value,
//         JSON.parse(JSON.stringify(newBlocks))
//       );
//       await api.setDoctorsDateMeta(
//         currentDate.value,
//         JSON.parse(JSON.stringify(availableDoctors.value))
//       );
//     }
//   },
//   { deep: true }
// );

watch(selectedDate, async (newDate) => {
  console.log("Watch Selected Date", newDate);
  console.log("current Date", currentDate);
  const doctors = await api.getDoctorsDateMeta(newDate);
  const blocks = await api.getBlocksDateMeta(newDate);

  availableDoctors.value = await api.getDoctorsDateMeta(newDate);
  if (doctors.length === 0) {
    console.warn("Нет доступных врачей для текущей даты");
    availableDoctors.value = await api.getDoctorsMeta();
    console.log("Available doctors:", availableDoctors.value);
  } else {
    availableDoctors.value = doctors;
  }

  if (blocks.length === 0) {
    console.warn("Нет блоков для текущего врача");
    currentBlocks.value = await api.getBlocksMeta();
    console.log("Current blocks:", currentBlocks.value);
  } else {
    currentBlocks.value = blocks;
  }
});
watch(selectedDoctor, async (newSelectedDoctor) => {
  console.log("Watch", newSelectedDoctor);
  if (newSelectedDoctor === "None") {
    console.log("Доктор не выбран, пропускается");
    return;
  }
  currentBlocks.value = await api.getBlocksForDoctor(
    selectedDate.value,
    newSelectedDoctor
  );
  if (currentBlocks.value.length === 0) {
    currentBlocks.value = await api.getBlocksDateMeta(selectedDate.value);
  }
});
</script>

<template>
  <div class="container">
    <div class="title">
      <h1>4 отделение ЦББ</h1>
      <h2>Проверочный лист</h2>
    </div>

    <div class="line">
      <span>Дата</span>
      <input
        type="date"
        v-model="selectedDate"
        :max="currentDate"
        lang="ru-RU"
      />
      <!-- <button @click="saveFile()" :disabled="saveButtonDisable">
        Сохранить
      </button> -->
      <button @click="restoreInitialState()">Сбросить</button>
      <div v-if="actionStatus" :style="{ backgroundColor: statusColor }">
        {{ actionStatus.message }}
      </div>
      <div class="auto-save-indicator">
        <span>🔄 Автосохранение включено</span>
      </div>
    </div>

    <div class="line">
      <span>ФИО врача</span>
      <select
        v-model="selectedDoctor"
        :disabled="availableDoctors.length === 0"
        placeholder="Выберите врача"
      >
        <option value="" v-if="availableDoctors.length === 0">
          Нет данных за выбранную дату
        </option>

        <option
          v-for="doctor in availableDoctors"
          :value="doctor.name"
          :key="doctor.name"
        >
          {{ doctor.name }}
        </option>
      </select>
      <div>
        <span>Отметить все</span>
        <input
          v-model="currentCheck"
          @click="checkAllComplete()"
          type="checkbox"
        />
      </div>
    </div>

    <div>
      <table>
        <thead>
          <tr>
            <th scope="col" rowspan="2">№</th>
            <th scope="col" rowspan="2">Наименование пункта проверки</th>
            <th scope="col" colspan="2">Оценка состояния</th>
            <th scope="col" rowspan="2">Примечание</th>
          </tr>
          <tr>
            <th scope="col">Сделано</th>
            <th scope="col">Не сделано</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="block in currentBlocks" :key="block.label">
            <tr>
              <th colspan="5">{{ block.label }}</th>
            </tr>
            <tr v-for="task in block.tasks" :key="task.label">
              <th>{{ task.number }}</th>
              <td>{{ task.label }}</td>
              <th>
                <input
                  type="checkbox"
                  v-model="task.status.complete"
                  :disabled="isReadonly"
                  @change="task.status.notComplete = !task.status.complete"
                />
              </th>
              <th>
                <input
                  type="checkbox"
                  v-model="task.status.notComplete"
                  :disabled="isReadonly"
                  @change="task.status.complete = !task.status.notComplete"
                />
              </th>
              <th>
                <textarea
                  lang="ru-RU"
                  v-model="task.description"
                  placeholder="Введите примечание..."
                  :readonly="isReadonly"
                  inputmode="text"
                  spellcheck="true"
                ></textarea>
              </th>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped></style>
