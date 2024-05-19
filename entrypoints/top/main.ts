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

// CodeMirror
import VueCodemirror from "vue-codemirror";
import { minimalSetup, EditorView } from "codemirror";
import { getCM, vim, Vim } from "@replit/codemirror-vim";
import { keymap } from "@codemirror/view";
import { yankGenerator } from "@/libs/yank";

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
  .use(pinia)
  .use(VueCodemirror, {
    extensions: [vim(), minimalSetup, EditorView.lineWrapping, customKeymap],
  })
  .mount("#app");
