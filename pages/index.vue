<template>
  <VAppBar theme="dark" color="#545c64">
    <template #prepend>
      <VAppBarTitle class="text-h6"></VAppBarTitle>
    </template>
    <template #append>
      <VBtn icon="mdi-table-column" @click="settings.gridColumns = 1"></VBtn>
      <VBtn icon="mdi-grid-large" @click="settings.gridColumns = 2"></VBtn>
      <VBtn icon="mdi-grid" @click="settings.gridColumns = 3"></VBtn>
    </template>
  </VAppBar>
  <VRow>
    <VCol :cols="12 / settings.gridColumns" v-for="article in data">
      <VCard height="100%" :to="article._path">
        <VImg :src="app.baseURL.replace(/.$/, '') + article.image" :aspectRatio="3 / 4" cover></VImg>
        <VCardItem>
          <h3 class="text-center py-2" :class="[{ 'text-h3': settings.gridColumns === 1 }, { 'text-h4': settings.gridColumns === 2 }, { 'text-h5': settings.gridColumns === 3 }]">
            {{ article.title }}
          </h3>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol> </VCol>
  </VRow>
</template>
<script lang="ts" setup>
const { data } = await useAsyncData('kinh', () => queryContent('kinh').only(['title', 'image', '_path']).sort({ title: 1 }).find())

const settings = useAppConfig()

const { app } = useRuntimeConfig()

const colors = ['#f5e4e4', '#f5ebcd', '#e2eee2', '#e1e8e8', '#eae4d3', '#e5e3df', '#ffffff']
</script>
