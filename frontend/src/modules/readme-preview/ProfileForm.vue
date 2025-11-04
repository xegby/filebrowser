<template>
  <!-- Render as its own column within the settings row -->
  <div class="column">
    <form class="card" @submit.prevent="update">
      <div class="card-title">
        <h2>README Preview</h2>
      </div>

      <div class="card-content">
        <p>
          <input type="checkbox" name="readmePreview" v-model="enabled" />
          {{ t('label') }}
        </p>
      </div>

      <div class="card-action">
        <input
          class="button button--flat"
          type="submit"
          name="submitReadmePreview"
          :value="tCore('buttons.update')"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { users as api } from '@/api';
import { useI18n } from 'vue-i18n';
import type { IUserExtended } from '@/modules/types';

const auth = useAuthStore();

// Localized label only; reuse core i18n for button and messages
const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      label: 'Show README preview in folders',
    },
    ru: {
      label: 'Показывать предпросмотр README в каталогах',
    },
  },
});

// Access core i18n via another instance bound to global scope
const { t: tCore } = useI18n();

const $showSuccess = inject<IToastSuccess>('$showSuccess')!;
const $showError = inject<IToastError>('$showError')!;

const enabled = ref<boolean>(false);

// Keep local toggle in sync with store's user when it becomes available/refreshed
watch(
  () => auth.user,
  (u) => {
    enabled.value = !!(u as IUserExtended | null)?.readmePreview;
  },
  { immediate: true }
);

const update = async () => {
  try {
    if (!auth.user) throw new Error('User is not set!');
    const data = {
      ...auth.user,
      id: auth.user.id,
      readmePreview: enabled.value,
    };
    await api.update(data, ['readmePreview']);
    auth.updateUser(data);
    $showSuccess(tCore('settings.settingsUpdated'));
  } catch (err) {
    if (err instanceof Error) $showError(err);
  }
};
</script>
