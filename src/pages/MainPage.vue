<script setup>
import { ref, computed } from 'vue'
import stateJSON from '@/state.json'
import TasksTable from '@/components/TasksTable.vue'

const state = ref({ ...stateJSON })

const currentDate = state.value.date || new Date().toISOString().split('T')[0]
const selectedDate = ref(currentDate)
</script>

<template>
  <div class="container">
    <div class="title">
      <h1>4 отделение ЦББ</h1>
      <h2>Проверочный лист</h2>
    </div>

    <div class="line">
      <span>Дата</span>
      <input type="date" v-model="selectedDate" />
    </div>
    <div class="line">
      <span>ФИО врача</span>
      <select>
        <option v-for="doctor in state.doctors" :value="doctor.name">{{ doctor.name }}</option>
      </select>
      <div><span>Отметить все</span> <input type="checkbox" /></div>
    </div>
    <TasksTable :state="state"></TasksTable>
  </div>
</template>

<style scoped>
/* Общие стили для контейнера */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #fff;
  min-height: 100vh;
}

/* Стили для заголовка */
.title {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 2px solid #e9ecef;
}

.title h1 {
  margin: 0 0 10px 0;
  color: #212529;
  font-size: 28px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.title h2 {
  margin: 0;
  color: #6c757d;
  font-size: 18px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Стили для строк с элементами управления */
.line {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.line span {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
  font-size: 14px;
}

/* Стили для поля даты */
input[type='date'] {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: white;
  cursor: pointer;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

input[type='date']:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Стили для выпадающего списка */
select {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background-color: white;
  cursor: pointer;
  min-width: 200px;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

select option {
  padding: 8px 12px;
}

/* Контейнер для чекбокса "Отметить все" */
.line div {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding: 8px 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.line div:hover {
  background-color: #e9ecef;
}

.line div span {
  font-weight: 500;
  color: #495057;
  font-size: 13px;
  min-width: auto;
}

.line div input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #007bff;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .title h1 {
    font-size: 24px;
  }

  .title h2 {
    font-size: 16px;
  }

  .line {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .line span {
    min-width: auto;
    margin-bottom: 5px;
  }

  .line div {
    margin-left: 0;
    justify-content: center;
  }

  select {
    min-width: auto;
    width: 100%;
  }

  input[type='date'] {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .title {
    padding: 15px 0;
  }

  .title h1 {
    font-size: 20px;
  }

  .title h2 {
    font-size: 14px;
  }

  .line {
    padding: 12px;
  }
}
</style>
