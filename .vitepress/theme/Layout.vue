<script setup lang="ts">
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { computed } from "vue";
import Home from "./components/Home.vue";
import ReaderTools from "./components/ReaderTools.vue";
import ReadingProgress from "./components/ReadingProgress.vue";
import ShareSection from "./components/ShareSection.vue";
import ChapterPagerTop from "./components/ChapterPagerTop.vue";
import ScheduleToast from "./components/ScheduleToast.vue";

const { Layout } = DefaultTheme;
const { page } = useData();

const isHome = computed(() => page.value.relativePath === "index.md");
const isReader = computed(() => !isHome.value && !page.value.isNotFound);
</script>

<template>
  <ScheduleToast />
  <Home v-if="isHome" />
  <template v-else>
    <ReadingProgress v-if="isReader" />
    <Layout>
      <template v-if="isReader" #doc-before>
        <ChapterPagerTop />
      </template>
    </Layout>
    <ShareSection v-if="isReader" />
    <div
      v-if="isReader"
      aria-hidden="true"
      class="print:hidden"
      style="height: calc(4.5rem + env(safe-area-inset-bottom))"
    />
    <ReaderTools v-if="isReader" />
  </template>
</template>
