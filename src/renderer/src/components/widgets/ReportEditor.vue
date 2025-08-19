<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect, onUnmounted } from "vue";
import { api } from "../../api";
import { Doctor, Block } from "../../../../types";
import { deleteProxy } from "../../utils";

const currentBlocks = ref<Block[]>([]);
let currentDate = new Date().toISOString().split("T")[0];
const currentCheck = ref(false);
const selectedDate = ref(currentDate);
const selectedDoctor = ref("Выберите врача");
const availableDoctors = ref<Doctor[]>([]);
const isReadonly = ref(true);

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

const checkAllComplete = () => {
  console.log("i work", currentCheck.value);
  currentBlocks.value.forEach((block) => {
    block.tasks.forEach((task) => {
      task.status.complete = !currentCheck.value;
    });
  });
};

const saveReport = async () => {
  const metaDateBlocks = await api.getBlocksDateMeta(selectedDate.value);
  const metaDateDoctors = await api.getDoctorsDateMeta(selectedDate.value);

  if (metaDateBlocks.length === 0) {
    const metaBlocks = await api.getBlocksMeta();
    await api.setBlocksDateMeta(selectedDate.value, metaBlocks);
  }
  if (metaDateDoctors.length === 0) {
    const metaDoctors = await api.getDoctorsMeta();
    await api.setDoctorsDateMeta(selectedDate.value, metaDoctors);
  }

  await api.setBlocksForDoctor(
    selectedDate.value,
    selectedDoctor.value,
    deleteProxy(currentBlocks.value)
  );
  console.log("SAVE");
};
watch(selectedDate, async (newDate) => {
  console.log("Watch Selected Date", newDate);
  const doctors = await api.getDoctorsDateMeta(newDate);
  const blocks = await api.getBlocksDateMeta(newDate);

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
  selectedDoctor.value = "Выберите врача";
  console.log(newDate === currentDate);
  newDate === currentDate
    ? (isReadonly.value = true)
    : (isReadonly.value = false);
});
watch(selectedDoctor, async (newSelectedDoctor) => {
  console.log("Watch", newSelectedDoctor);
  if (newSelectedDoctor === "Выберите врача") {
    console.log("Доктор не выбран, пропускается");
    return;
  }

  const blocksForDoctor = await api.getBlocksForDoctor(
    selectedDate.value,
    newSelectedDoctor
  );

  if (blocksForDoctor.length === 0) {
    const blocksDateMeta = await api.getBlocksDateMeta(selectedDate.value);
    if (blocksDateMeta.length === 0)
      currentBlocks.value = await api.getBlocksMeta();
  } else {
    currentBlocks.value = blocksForDoctor;
  }
});

const isDoctorSelect = computed(() =>
  availableDoctors.value
    .map((value) => value.name)
    .includes(selectedDoctor.value)
);

const restoreInitialState = async () => {
  currentBlocks.value = await api.getBlocksDateMeta(selectedDate.value);
  await api.setBlocksForDoctor(
    selectedDate.value,
    selectedDoctor.value,
    deleteProxy(currentBlocks.value)
  );
  console.log("done");
};
</script>

<template>
  <div class="container">
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
      <button @click="restoreInitialState">Сбросить</button>
      <div class="auto-save-indicator">
        <span>🔄 Автосохранение включено</span>
      </div>
    </div>

    <div class="line">
      <span>ФИО врача</span>
      <select
        v-model="selectedDoctor"
        :disabled="availableDoctors.length === 0"
      >
        <option selected>Выберите врача</option>

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
        <span>Редактирование </span>
        <input v-model="isReadonly" type="checkbox" />
      </div>
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

        <tbody v-if="!isDoctorSelect">
          <tr>
            <th colspan="5">Выберите врача</th>
          </tr>
        </tbody>
        <tbody v-else>
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
                  :disabled="!isReadonly"
                  @click="saveReport"
                  @change="task.status.notComplete = !task.status.complete"
                />
              </th>
              <th>
                <input
                  type="checkbox"
                  v-model="task.status.notComplete"
                  :disabled="!isReadonly"
                  @click="saveReport"
                  @change="task.status.complete = !task.status.notComplete"
                />
              </th>
              <th>
                <textarea
                  lang="ru-RU"
                  v-model="task.description"
                  placeholder="Введите примечание..."
                  :readonly="!isReadonly"
                  inputmode="text"
                  spellcheck="true"
                  @change="saveReport"
                  @keypress.enter="saveReport"
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
