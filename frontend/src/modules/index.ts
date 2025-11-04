import type { App } from "vue";
import ExtensionsMount from "@/modules/ExtensionsMount.vue";

export default {
  install(app: App) {
    // Provide a global mount point component for extension targets
    app.component("ExtensionsMount", ExtensionsMount);

    // Load modules after app plugins (incl. Pinia) are installed
    void import("@/modules/readme-preview/register");
    void import("@/modules/auth-refresh/register");
  },
};
