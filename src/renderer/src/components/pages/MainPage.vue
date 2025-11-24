<!-- src/renderer/src/components/pages/MainPage.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../api';
import ReportEditor from '../widgets/ReportEditor.vue';
import ConfigEditor from '../widgets/ConfigEditor.vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Menubar from 'primevue/menubar';

const currentPage = ref('report');
const title = ref('Подразделение');

onMounted(async () => {
  title.value = await api.getTitle();
});

const updateTitle = (newTitle: string) => {
  title.value = newTitle;
};

const menuItems = [
  {
    label: 'Проверочный лист',
    icon: 'pi pi-fw pi-check-square',
    command: () => {
      currentPage.value = 'report';
    }
  },
  {
    label: 'Конфигурация',
    icon: 'pi pi-fw pi-cog',
    command: () => {
      currentPage.value = 'config';
    }
  }
];
</script>

<template>
  <div class="main-page">
    <div class="header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="app-title">{{ title }}</h1>
        </div>
        <Menubar :model="menuItems" class="header-menu" />
      </div>
    </div>

    <div class="content">
      <ReportEditor v-if="currentPage === 'report'" />
      <ConfigEditor v-else @update-title="updateTitle" />
    </div>
  </div>
</template>

<style scoped>
.main-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--surface-ground);
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.title-section {
  flex: 1;
}

.app-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.header-menu {
  border: none;
  background: transparent;
}

:deep(.p-menubar) {
  padding: 0;
  background: transparent;
  border: none;
}

:deep(.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-link) {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-link:hover) {
  background: var(--surface-ground);
  color: var(--primary-color);
}

.content {
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    gap: 12px;
    padding: 12px 20px;
  }

  .app-title {
    font-size: 20px;
  }

  .header-menu {
    width: 100%;
  }

  :deep(.p-menubar .p-menubar-root-list) {
    flex-direction: column;
    width: 100%;
  }

  :deep(.p-menubar .p-menubar-root-list > .p-menuitem) {
    width: 100%;
  }

  :deep(.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-link) {
    display: block;
    width: 100%;
  }
}
</style>