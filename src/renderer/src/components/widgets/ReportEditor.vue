<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect, onUnmounted } from "vue";
import { api } from "@renderer/api";
import { deleteProxy } from "@renderer/utils";
import { useConfirm } from "@renderer/composables/useConfirm";
import { toast } from "vue-sonner";

const { confirm } = useConfirm();

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
  console.log(availableDoctors.value, currentBlocks.value);
  if (availableDoctors.value.length === 0) {
    availableDoctors.value = await api.getDoctorsMeta();
  }
  if (currentBlocks.value.length === 0) {
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

  if (availableDoctors.value.length === 0 && currentBlocks.value.length === 0) {
    toast.warning("Укажите врачей и задачи в редакторе конфигурации!");
  } else if (availableDoctors.value.length === 0) {
    toast.warning("Укажите врачей в редакторе конфигурации!");
  } else if (currentBlocks.value.length === 0) {
    toast.warning("Укажите задачи в редакторе конфигурации!");
  }
});

const checkAllComplete = () => {
  console.log("i work", currentCheck.value);
  currentBlocks.value.forEach((block) => {
    block.tasks.forEach((task) => {
      task.status.complete = !currentCheck.value;
      task.status.notComplete = false;
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

const loadMetaForSelectedDate = async () => {
  console.log("Selected Date", selectedDate.value);
  const doctors = await api.getDoctorsDateMeta(selectedDate.value);
  const blocks = await api.getBlocksDateMeta(selectedDate.value);

  if (doctors.length === 0) {
    console.warn("Нет доступных врачей для текущей даты");
    availableDoctors.value = await api.getDoctorsMeta();
    console.log("Available doctors:", availableDoctors.value);
  } else {
    availableDoctors.value = doctors;
  }

  if (blocks.length === 0) {
    currentBlocks.value = await api.getBlocksMeta();
    console.warn("Нет блоков для текущего врача");
    console.log("Current blocks:", currentBlocks.value);
  } else {
    currentBlocks.value = blocks;
  }
  selectedDoctor.value = "Выберите врача";
  console.log(selectedDate.value === currentDate);
  selectedDate.value === currentDate
    ? (isReadonly.value = true)
    : (isReadonly.value = false);
};

watch(selectedDoctor, async (newSelectedDoctor) => {
  console.log("Watch", newSelectedDoctor);
  if (newSelectedDoctor === "") {
    console.log("Доктор не выбран, пропускается");
    return;
  }

  const blocksForDoctor = await api.getBlocksForDoctor(
    selectedDate.value,
    newSelectedDoctor
  );
  console.log("NEW currentBlocks", blocksForDoctor);

  if (blocksForDoctor.length === 0) {
    const blocksDateMeta = await api.getBlocksDateMeta(selectedDate.value);
    console.log("NEW NEW currentBlocks", blocksDateMeta);

    if (blocksDateMeta.length === 0) {
      currentBlocks.value = await api.getBlocksMeta();
    } else {
      currentBlocks.value = blocksDateMeta;
    }
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
  if (await confirm("Вы действительно хотите очистить форму?")) {
    currentBlocks.value = await api.getBlocksDateMeta(selectedDate.value);
    await api.setBlocksForDoctor(
      selectedDate.value,
      selectedDoctor.value,
      deleteProxy(currentBlocks.value)
    );
    console.log("restoreInitialState");
  }
};

const toCurrentDate = async () => {
  selectedDate.value = currentDate;
  await loadMetaForSelectedDate();
};
</script>

<template>
  <div class="container">
    <div class="line">
      <div class="flex-row">
        <label for="dateReport" class="dateReport"> Дата</label>
        <input
          @change="loadMetaForSelectedDate"
          id="dateReport"
          type="date"
          v-model="selectedDate"
          :max="currentDate"
          lang="ru-RU"
        />
        <button @click="toCurrentDate">Перейти к сегодняшней дате</button>
      </div>

      <!-- <button @click="saveFile()" :disabled="saveButtonDisable">
        Сохранить
      </button> -->
    </div>

    <div class="line">
      <div class="flex-row">
        <label for="select" class=""> ФИО врача</label>
        <select
          id="select"
          v-model="selectedDoctor"
          :disabled="availableDoctors.length === 0"
        >
          <option selected disabled hidden>Выберите врача</option>

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
      </div>
      <div class="flex-row">
        <div class="block">
          <label for="edit" class=""> Редактировать</label>
          <input v-model="isReadonly" id="edit" type="checkbox" />
        </div>

        <div class="block">
          <label for="checkAll" class=""> Выбрать все</label>
          <input
            id="checkAll"
            v-model="currentCheck"
            @click="checkAllComplete()"
            type="checkbox"
          />
        </div>
        <button @click="restoreInitialState" class="btn btn-danger">
          Очистить форму
        </button>
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
                  @change="
                    task.status.complete
                      ? (task.status.notComplete = false)
                      : (task.status.complete = true)
                  "
                />
              </th>
              <th>
                <input
                  type="checkbox"
                  v-model="task.status.notComplete"
                  :disabled="!isReadonly"
                  @click="saveReport"
                  @change="
                    task.status.notComplete
                      ? (task.status.complete = false)
                      : (task.status.notComplete = true)
                  "
                />
              </th>
              <th>
                <textarea
                  lang="ru-RU"
                  v-model="task.description"
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

<style scoped>
.flex-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}
label[for="dateReport"] {
  margin-right: 40px;
}
</style>
