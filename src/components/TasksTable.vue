<script setup>
defineProps({
  state: {
    type: Object,
    required: true,
  },
})
</script>

<template>
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
        <template v-for="block in state.blocks">
          <tr>
            <th colspan="5">{{ block.label }}</th>
          </tr>
          <tr v-for="task in block.tasks">
            <th>{{ task.number }}</th>
            <td>{{ task.label }}</td>
            <th>
              <input type="checkbox" v-model="task.state.complete" />
            </th>
            <th>
              <input type="checkbox" v-model="task.state.notComplete" />
            </th>

            <th>
              <textarea v-model="task.description"></textarea>
            </th>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
/* Основные стили для таблицы */
table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  font-size: 14px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Стили для заголовков */
th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #dee2e6;
  vertical-align: middle;
}

/* Стили для ячеек */
td {
  padding: 10px 8px;
  border: 1px solid #dee2e6;
  vertical-align: middle;
  background-color: #fff;
}

/* Заголовки блоков (colspan="5") */
th[colspan='5'] {
  background-color: #e9ecef;
  color: #212529;
  font-weight: 700;
  text-align: left;
  padding: 15px 12px;
  font-size: 15px;
}

/* Стили для чекбоксов */
input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #007bff;
}

/* Контейнер для чекбоксов */
th:has(input[type='checkbox']) {
  text-align: center;
  padding: 12px;
}

/* Стили для текстовых областей */
textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.4;
  box-sizing: border-box;
}

textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Hover эффекты для строк */
tbody tr:hover td {
  background-color: #f8f9fa;
}

/* Стили для номеров */
th:first-child {
  width: 60px;
  text-align: center;
}

/* Колонка с описанием задач */
td:nth-child(2) {
  text-align: left;
  padding-left: 12px;
}

/* Колонки с чекбоксами */
th:nth-child(3),
th:nth-child(4) {
  width: 100px;
}

/* Колонка с примечаниями */
th:last-child {
  width: 200px;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  table {
    font-size: 12px;
  }

  th,
  td {
    padding: 8px 4px;
  }

  textarea {
    min-height: 40px;
    font-size: 11px;
  }

  th:last-child {
    width: 150px;
  }
}

/* Дополнительные стили для улучшения внешнего вида */
.table-container {
  overflow-x: auto;
  margin: 20px 0;
}

/* Альтернативная окраска строк */
tbody tr:nth-child(even) td {
  background-color: #f8f9fa;
}

tbody tr:nth-child(odd) td {
  background-color: #ffffff;
}

/* Сброс hover для заголовков блоков */
tbody tr:has(th[colspan='5']):hover th,
tbody tr:has(th[colspan='5']):hover td {
  background-color: #e9ecef;
}
</style>
