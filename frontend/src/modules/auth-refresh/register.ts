import { watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { users as apiUsers } from "@/api";
import type { IUserExtended } from "@/modules/types";

// Side-effect module: refresh full user profile when JWT/user changes.
// Keeps upstream auth.ts minimal by moving profile fetching here.
(function setupAuthRefresh() {
  const auth = useAuthStore();

  // Track last fetched tuple to avoid duplicate requests
  let lastKey = "";

  watch(
    () => [auth.jwt, auth.user?.id] as const,
    async ([jwt, userId]) => {
      if (!jwt || typeof userId !== "number") return;

      const key = `${jwt}:${userId}`;
      if (key === lastKey) return;
      lastKey = key;

      try {
        const fullUser = (await apiUsers.get(userId)) as IUserExtended;
        auth.updateUser(fullUser);
      } catch {
        // ignore fetch errors to avoid disrupting auth flow
      }
    },
    { immediate: true }
  );
})();
