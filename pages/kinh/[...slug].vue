<template>
  <v-navigation-drawer v-model="show" temporary width="50%">
    <VToolbar title="Mục lục">
      <VBtn icon @click="show = !show">
        <VIcon>mdi-close</VIcon>
      </VBtn>
    </VToolbar>

    <v-divider></v-divider>

    <v-list-item lines="two" v-for="link of tableOfContents" :key="link.id" link :href="`#${link.id}`">
      <VListItemTitle :style="`font-size: ${settings.fontSize}px`">{{ link.text }}</VListItemTitle>
    </v-list-item>
  </v-navigation-drawer>

  <VAppBar theme="dark" color="#545c64">
    <template #prepend>
      <VAppBarNavIcon @click="$router.push('/')" icon="mdi-chevron-left"></VAppBarNavIcon>
      <!-- <VAppBarTitle class="text-h6"> {{ page.title }}</VAppBarTitle> -->
      <VBtn variant="text" class="text-h6" @click="show = !show"> {{ page.title }}</VBtn>
    </template>
    <template #append>
      <VBtn icon="mdi-format-font-size-decrease" @click="settings.fontSize--"></VBtn>
      <VBtn icon="mdi-format-font-size-increase" @click="settings.fontSize++"></VBtn>
      <VBtn icon="mdi-format-list-bulleted" @click="show = !show"></VBtn>
    </template>
  </VAppBar>
  
  <article class="content" :style="`font-size: ${settings.fontSize + 2}px`">
    <h1 class="text-center text-h3 font-weight-bold my-16">{{ page.title }}</h1>
    <VImg :src="app.baseURL.replace(/.$/, '') + page.image" :alt="page.title" cover class="ma-16" />
    <ul v-if="tableOfContents.length > 0">
      <li :key="link.id" v-for="link of tableOfContents">
        <NuxtLink :to="`#${link.id}`">{{ link.text }}</NuxtLink>
      </li>
    </ul>
    <ContentRenderer :value="page" />
  </article>
</template>

<script lang="ts" setup>
const { app } = useRuntimeConfig()
const colors = ['#f5e4e4', '#f5ebcd', '#e2eee2', '#e1e8e8', '#eae4d3', '#e5e3df', '#ffffff']
const { toc, page } = useContent()
const show = ref(false)
const tableOfContents = toc.value.links.filter((item: any) => item.depth === 2)

const data = localStorage.getItem('settings')

const settings = ref(
  data
    ? JSON.parse(data)
    : {
        fontSize: 16,
      }
)

watch(settings.value, (value) => {
  localStorage.setItem('settings', JSON.stringify(value))
})
</script>
