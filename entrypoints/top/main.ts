import "./main.css";
import { createApp } from "vue";
import App from "./App.vue";
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";

// Vuetify
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components,
  directives,
});

// Prism
import "prismjs/themes/prism-okaidia.css";
import "prismjs/components/prism-json";

// vue-mention
import "floating-vue/dist/style.css";

// Pinia
import { createPinia } from "pinia";
const pinia = createPinia();

createApp(App)
  .use(vuetify)
  .use(Vue3Toastify, { autoClose: 1000 })
  .use(pinia)
  .mount("#app");
