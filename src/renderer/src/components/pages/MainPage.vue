<script setup lang="ts">
import { ref } from "vue";
import ReportEditor from "../widgets/ReportEditor.vue";
import ConfigEditor from "../widgets/ConfigEditor.vue";

const currentPage = ref("report");
</script>

<template>
  <div>
    <div class="title">
      <h1>4 отделение ЦББ</h1>
      <div class="nav">
        <button @click="currentPage = 'report'">Проверочный лист</button>
        <button @click="currentPage = 'config'">Конфигурация</button>
      </div>
    </div>
  </div>

  <ReportEditor v-show="currentPage === 'report'" />
  <ConfigEditor v-show="currentPage === 'config'" />
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
