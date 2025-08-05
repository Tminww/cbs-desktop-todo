<script setup>
import { ref, computed, onMounted } from 'vue'
import initialState from '@/state.json'
import { api } from '@/api'

const state = ref({ ...initialState })

onMounted(async () => {
  const { content, ...rest } = await api.openFile({ date: 'initial' })
  state.value = JSON.parse(content)
})

const currentDate = state.value.date || new Date().toISOString().split('T')[0]
const currentCheck = ref(false)
const selectedDate = ref(currentDate)
const selectedDoctor = ref(state.value.doctors[0].name)
const actionStatus = ref('')
const saveButtonDisable = computed(() => !(currentDate == selectedDate.value))

const restoreInitialState = async () => {
  console.log('Update')
  console.log(state.value.blocks[0].tasks[0])
  console.log(initialState.blocks[0].tasks[0])

  const { content, ...rest } = await api.openFile({ date: 'initial' })
  state.value = JSON.parse(content)

  selectedDate.value = currentDate
  currentCheck.value = false
  actionStatus.value = ''
  selectedDoctor.value = state.value.doctors[0].name
}

const saveFile = async () => {
  let currentState = {
    doctors: [{ name: selectedDoctor.value }],
    blocks: [...state.value.blocks],
    date: currentDate,
  }
  console.log(currentState)
  currentState = JSON.stringify(currentState)

  timeoutActionStatus(await api.saveFile({ content: currentState, date: currentDate }))
}

const openFile = async () => {
  const { message, status, content } = await api.openFile({ date: selectedDate.value })
  // console.log(JSON.parse(actionStatus.value.content))
  timeoutActionStatus({ message, status })
  console.log(content)
  if (content) {
    state.value = JSON.parse(content)
    selectedDoctor.value = state.value.doctors[0].name
  }
}

const checkAllComplete = () => {
  console.log('i work', currentCheck.value)
  state.value.blocks.forEach((block) => {
    block.tasks.forEach((task) => {
      task.state.complete = !currentCheck.value
    })
  })
}

const statusColor = computed(() => {
  let color = 'gray'
  if (actionStatus.value.status) {
    color = actionStatus.value.status === 'error' ? 'crimson' : 'lightgreen'
  }
  console.log(color)
  return color
})

const timeoutActionStatus = (status) => {
  actionStatus.value = status
  setTimeout(() => {
    actionStatus.value = ''
  }, 3000)
}
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
      <!-- <button @click="api.sendPing()">ping</button> -->
      <button @click="openFile()">Загрузить</button>
      <button @click="saveFile()" :disable="saveButtonDisable">Сохранить</button>
      <button @click="restoreInitialState()">Обновить</button>
      <div v-if="actionStatus" :style="{ backgroundColor: statusColor }">
        {{ actionStatus.message }}
      </div>
    </div>
    <div class="line">
      <span>ФИО врача</span>
      <select v-model.value="selectedDoctor">
        <option v-for="doctor in state.doctors" :value="doctor.name" :key="doctor.name">
          {{ doctor.name }}
        </option>
      </select>
      <div>
        <span>Отметить все</span>
        <input v-model="currentCheck" @click="checkAllComplete()" type="checkbox" />
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
                <input type="checkbox" v-model="task.state.complete" />
              </th>
              <th>
                <input type="checkbox" v-model="task.state.notComplete" />
              </th>

              <th>
                <textarea v-model="task.description" placeholder="Введите примечание..."></textarea>
              </th>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped></style>
