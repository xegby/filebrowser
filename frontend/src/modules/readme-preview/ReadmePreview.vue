<template>
  <div v-if="showReadme" id="readme-preview" class="md_preview" aria-labelledby="readme-title">
    <h2 id="readme-title">README.md</h2>
    <div v-html="readmeHtml"></div>
  </div>
  
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/file";
import { files as api } from "@/api";
import DOMPurify from "dompurify";
import { marked } from "marked";
import type { IUserExtended } from "@/modules/types";

const authStore = useAuthStore();
const fileStore = useFileStore();

const readmeHtml = ref("");
const showReadme = ref(false);
const readmeRequestId = ref(0);

const shouldPreviewReadme = computed(() =>
  Boolean((authStore.user as IUserExtended | null)?.readmePreview)
);

const loadReadme = async () => {
  // Ensure that only the latest request updates the preview.
  readmeRequestId.value += 1;
  const requestId = readmeRequestId.value;

  // Reset the previous preview before requesting new data.
  readmeHtml.value = "";
  showReadme.value = false;

  // Skip the preview entirely when the user has disabled it.
  if (!shouldPreviewReadme.value) return;

  const current = fileStore.req;
  // README is only available when the current entry is a directory.
  if (!current?.isDir) return;

  // Locate the README file in the current directory listing.
  const readmeItem = current.items.find(
    (item) => !item.isDir && item.name.toLowerCase() === "readme.md"
  );
  if (!readmeItem) return;

  try {
    const resource = await api.fetch(readmeItem.url);
    if (requestId !== readmeRequestId.value) return;
    if (!resource.content) return;

    // Render the README markdown into sanitized HTML for the preview.
    readmeHtml.value = DOMPurify.sanitize(await marked(resource.content));
    showReadme.value = true;
  } catch (error) {
    // Abort if a new request was initiated after this one.
    if (requestId !== readmeRequestId.value) return;
    // eslint-disable-next-line no-console
    console.error("Failed to load README.md", error);
  }
};

watch(
  () => fileStore.req,
  () => {
    loadReadme();
  }
);

watch(shouldPreviewReadme, () => {
  loadReadme();
});

onMounted(() => {
  loadReadme();
});
</script>

<style scoped>
/* Inherit any existing styles via classes already used by FileListing */
</style>
