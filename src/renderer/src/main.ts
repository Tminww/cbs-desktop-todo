import "@renderer/assets/style.css";
import "vue-sonner/style.css"; // Добавьте эту строку
import { createApp } from "vue";

import App from "./App.vue";

const app = createApp(App);

app.mount("#app");
