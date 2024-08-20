import { createApp } from "vue";
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import App from "./App.vue";
import "./main.css";

// Vuetify
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";

const vuetify = createVuetify({
  components,
  directives,
});

// Prism
import "prismjs/components/prism-json";
import "prismjs/themes/prism-okaidia.css";

// vue-mention
import "floating-vue/dist/style.css";

// ApexCharts
import VueApexCharts from "vue3-apexcharts";

// Pinia
import { createPinia } from "pinia";
const pinia = createPinia();

// CodeMirror
import { yankGenerator } from "@/libs/yank";
import { keymap } from "@codemirror/view";
import { getCM, vim, Vim } from "@replit/codemirror-vim";
import { EditorView, minimalSetup } from "codemirror";
import VueCodemirror from "vue-codemirror";

const moveFocus = (direction: "next" | "previous") => {
  const activeElement = document.activeElement;
  if (!activeElement) {
    return true;
  }

  const focusableElements = Array.prototype.filter.call(
    document.querySelectorAll(
      'div.cm-content, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
    (e) => e.offsetWidth > 0 || e.offsetHeight > 0 || e === activeElement,
  );

  const index = focusableElements.indexOf(activeElement);
  if (index === -1) {
    return true;
  }

  // XXX: 多分不完全
  const nextElement =
    focusableElements[direction === "next" ? index + 1 : index - 1] ||
    focusableElements[0];
  nextElement.focus();

  return true;
};

const customKeymap = keymap.of([
  {
    key: "Tab",
    run: (view) => {
      const mode = getCM(view)?.state.vim?.mode;
      if (mode === "normal" || mode === undefined) {
        return moveFocus("next");
      }
      return false;
    },
  },
  {
    key: "Shift-Tab",
    run: (view) => {
      const mode = getCM(view)?.state.vim?.mode;
      if (mode === "normal" || mode === undefined) {
        return moveFocus("previous");
      }
      return false;
    },
  },
  {
    key: "Escape",
    run: () => true,
    stopPropagation: true,
  },
]);

Vim.defineOperator("yank", yankGenerator(Vim.getRegisterController(), true));

createApp(App)
  .use(vuetify)
  .use(Vue3Toastify, { autoClose: 1000 })
  .use(VueApexCharts)
  .use(pinia)
  .use(VueCodemirror, {
    extensions: [vim(), minimalSetup, EditorView.lineWrapping, customKeymap],
  })
  .mount("#app");
