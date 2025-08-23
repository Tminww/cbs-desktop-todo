<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../../api";

import ReportEditor from "../widgets/ReportEditor.vue";
import ConfigEditor from "../widgets/ConfigEditor.vue";
const currentPage = ref("report");

onMounted(async () => {
  title.value = await api.getTitle();
});
const title = ref("Подразделение");
const updateTitle = (newTitle: string) => {
  console.log("NEW TITLE", newTitle);
  title.value = newTitle;
};
</script>

<template>
  <div>
    <div class="title">
      <h1>{{ title }}</h1>
      <div class="nav">
        <button @click="currentPage = 'report'">Проверочный лист</button>
        <button @click="currentPage = 'config'">Конфигурация</button>
      </div>
    </div>
  </div>

  <ReportEditor v-if="currentPage === 'report'" />
  <ConfigEditor @update-title="updateTitle" v-show="currentPage === 'config'" />
</template>

<style scoped>
.nav {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 5px;
  font-family: Arial, sans-serif;
}
button {
  width: 200px;
}
</style>
