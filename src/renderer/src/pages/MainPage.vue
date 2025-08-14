<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect, onUnmounted } from "vue";
import initialState from "@renderer/state.json";
import { api } from "@renderer/api";

const state = ref({ ...initialState });
let autoSaveInterval = null;

onMounted(async () => {
  const { content, ...rest } = await api.openFile({ date: "initial" });
  state.value = JSON.parse(content);

  // Загружаем врачей для текущей даты
  await loadDoctorsForDate(selectedDate.value);

  // Запускаем автосохранение для текущего дня
  startAutoSave();
});

const currentDate = new Date().toISOString().split("T")[0];
const currentCheck = ref(false);
const selectedDate = ref(currentDate);
const selectedDoctor = ref("");
const availableDoctors = ref([]);
const actionStatus = ref("");

// Проверяем, является ли выбранная дата сегодняшней
const isToday = computed(() => selectedDate.value === currentDate);
// Кнопка сохранить активна только для сегодняшнего дня и при выбранном враче
const saveButtonDisable = computed(
  () => !isToday.value || !selectedDoctor.value
);
// Поля только для чтения для всех дней кроме сегодняшнего
const isReadonly = computed(() => !isToday.value);

// Загрузка врачей для выбранной даты
const loadDoctorsForDate = async (date: string) => {
  try {
    if (date === currentDate) {
      // Для текущего дня всегда показываем всех врачей
      availableDoctors.value = [...initialState.doctors];
      if (!selectedDoctor.value) {
        selectedDoctor.value = initialState.doctors[0].name;
      }
    } else {
      // Для других дней загружаем только тех, у кого есть данные
      const { doctors, status } = await api.getDoctorsByDate({ date });
      if (status === "success" && doctors.length > 0) {
        availableDoctors.value = doctors.map((name) => ({ name }));
        selectedDoctor.value = doctors[0];
      } else {
        // Если врачей нет, очищаем список
        availableDoctors.value = [];
        selectedDoctor.value = "";
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки врачей:", error);
    if (date === currentDate) {
      availableDoctors.value = [...initialState.doctors];
      selectedDoctor.value = initialState.doctors[0].name;
    } else {
      availableDoctors.value = [];
      selectedDoctor.value = "";
    }
  }
};

// Автоматическая загрузка данных при смене даты
watch(selectedDate, async (newDate) => {
  stopAutoSave(); // Останавливаем автосохранение
  await loadDoctorsForDate(newDate);
  await openFile();

  // Запускаем автосохранение только для текущего дня
  if (newDate === currentDate) {
    startAutoSave();
  }
});

// Автоматическая загрузка данных при смене врача
watch(selectedDoctor, async (newDoctor) => {
  if (newDoctor) {
    await openFile();
  }
});

// Функции автосохранения
const startAutoSave = () => {
  if (!isToday.value) return;

  autoSaveInterval = setInterval(async () => {
    if (selectedDoctor.value && isToday.value) {
      await saveFile(true); // true означает автосохранение
    }
  }, 5000); // автосохранение каждые 30 секунд
};

const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
};

// Остановка автосохранения при размонтировании компонента
onUnmounted(() => {
  stopAutoSave();
});

const restoreInitialState = async () => {
  if (!isToday.value) {
    timeoutActionStatus({
      message: "Обновление доступно только для текущего дня",
      status: "error",
    });
    return;
  }

  console.log("Update");

  const { content, ...rest } = await api.openFile({ date: "initial" });
  state.value = JSON.parse(content);

  selectedDate.value = currentDate;
  currentCheck.value = false;
  actionStatus.value = "";

  await loadDoctorsForDate(selectedDate.value);
};

const saveFile = async (isAutoSave = false) => {
  if (!isToday.value) {
    if (!isAutoSave) {
      timeoutActionStatus({
        message: "Сохранение доступно только для текущего дня",
        status: "error",
      });
    }
    return;
  }

  if (!selectedDoctor.value) {
    if (!isAutoSave) {
      timeoutActionStatus({
        message: "Выберите врача для сохранения",
        status: "error",
      });
    }
    return;
  }

  let currentState = {
    doctors: [{ name: selectedDoctor.value }],
    blocks: [...state.value.blocks],
    date: selectedDate.value,
  };

  console.log(currentState);

  const result = await api.saveFile({
    content: JSON.stringify(currentState),
    date: selectedDate.value,
    doctor: selectedDoctor.value,
  });

  if (!isAutoSave) {
    timeoutActionStatus(result);
  } else {
    // Для автосохранения показываем краткое уведомление
    if (result.status === "success") {
      console.log("Автосохранение выполнено");
    }
  }
};

const openFile = async () => {
  if (!selectedDoctor.value) {
    return;
  }

  const { message, status, content } = await api.openFile({
    date: selectedDate.value,
    doctor: selectedDoctor.value,
  });

  if (content) {
    state.value = JSON.parse(content);
    console.log("Данные загружены для врача:", selectedDoctor.value);
  } else {
    // Если данных нет, создаем пустое состояние на основе начального
    const { content: initialContent } = await api.openFile({ date: "initial" });
    const initialData = JSON.parse(initialContent);

    // Создаем пустое состояние с той же структурой
    const emptyState = {
      ...initialData,
      date: selectedDate.value,
      doctors: [{ name: selectedDoctor.value }],
    };

    // Очищаем все состояния задач и описания
    emptyState.blocks = emptyState.blocks.map((block) => ({
      ...block,
      tasks: block.tasks.map((task) => ({
        ...task,
        state: { complete: false, notComplete: false },
        description: "",
      })),
    }));

    state.value = emptyState;
    console.log("Создано пустое состояние для врача:", selectedDoctor.value);
  }
};

const checkAllComplete = () => {
  if (!isToday.value) return; // Блокируем для не сегодняшних дат

  console.log("i work", currentCheck.value);
  state.value.blocks.forEach((block) => {
    block.tasks.forEach((task) => {
      task.state.complete = !currentCheck.value;
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

const timeoutActionStatus = (status) => {
  actionStatus.value = status;
  setTimeout(() => {
    actionStatus.value = "";
  }, 3000);
};
</script>

<template>
  <div class="container">
    <div class="title">
      <h1>4 отделение ЦББ</h1>
      <h2>Проверочный лист</h2>
    </div>

    <div class="line">
      <span>Дата</span>
      <input type="date" v-model="selectedDate" :max="currentDate" />
      <button @click="saveFile()" :disabled="saveButtonDisable">
        Сохранить
      </button>
      <button @click="restoreInitialState()" :disabled="!isToday">
        Сбросить
      </button>
      <div v-if="actionStatus" :style="{ backgroundColor: statusColor }">
        {{ actionStatus.message }}
      </div>
      <div v-if="isToday" class="auto-save-indicator">
        <span>🔄 Автосохранение включено</span>
      </div>
    </div>

    <div class="line">
      <span>ФИО врача</span>
      <select
        v-model="selectedDoctor"
        :disabled="!isToday && availableDoctors.length === 0"
      >
        <option value="" v-if="!isToday && availableDoctors.length === 0">
          Нет данных за выбранную дату
        </option>
        <option value="" v-else-if="isToday">Выберите врача</option>
        <option
          v-for="doctor in availableDoctors"
          :value="doctor.name"
          :key="doctor.name"
        >
          {{ doctor.name }}
        </option>
      </select>
      <div v-if="isToday">
        <span>Отметить все</span>
        <input
          v-model="currentCheck"
          @click="checkAllComplete()"
          type="checkbox"
        />
      </div>
      <div v-else class="readonly-indicator">
        <span>📖 Только просмотр</span>
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
          <template v-for="block in state.blocks" :key="block.label">
            <tr>
              <th colspan="5">{{ block.label }}</th>
            </tr>
            <tr v-for="task in block.tasks" :key="task.label">
              <th>{{ task.number }}</th>
              <td>{{ task.label }}</td>
              <th>
                <input
                  type="checkbox"
                  v-model="task.state.complete"
                  :disabled="isReadonly"
                  @change="task.state.notComplete = !task.state.complete"
                />
              </th>
              <th>
                <input
                  type="checkbox"
                  v-model="task.state.notComplete"
                  :disabled="isReadonly"
                  @change="task.state.complete = !task.state.notComplete"
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
