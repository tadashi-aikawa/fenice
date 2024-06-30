import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  imports: {
    addons: {
      vueTemplate: true,
    },
    presets: ["vue"],
  },
  manifest: {
    // @ts-expect-error: https://github.com/wxt-dev/wxt/issues/521
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzBUsz9KlGfCQ9DlG/Z+KsRTA2D8Dw/BR9Svz/KmMLe8+8ps2PY0nZrN2U2MLhDJ5wnJk7NfLIihUVc8MRijypg5rx5xnZMhZxpeQbTrvvAexFaTOu9TMr52M91lMBuRttBE2L70RzD0lXmDXRv0wLGhGdNzRpE4l3oEZq2BZjBUhduL7Z3jp+fE8kF4fKFI58HvrKs9JPbJ80Ql94cxJFcwuYq0pffnBXOCXbKYgu2PySajiSaeQsr59n8UOIBGFo+KfqLxnQ9As6tG+pDdWlqhm+tf4qcfgaIVJ3qUUhaAi3SClsK3fjneyD/QD3a58QHpYMSNcoXKd1PLMUzBkwwIDAQAB",
    permissions: [
      "identity",
      "storage",
      "unlimitedStorage",
      "notifications",
      "alarms",
      "tabs",
    ],
    host_permissions: [
      "https://slack.com/api/*",
      "https://files.slack.com/*",
      "https://github.com/tadashi-aikawa/fenice/raw/master/public/icon/*",
    ],
    action: {},
  },
});
