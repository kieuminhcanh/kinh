<template>
  <ContentDoc v-slot="{ doc }">
    <article class="content" :style="`font-size: ${settings.fontSize + 1}px`">
      <h1 class="text-center text-h3 font-weight-bold my-16">{{ doc.title }}</h1>
      <VImg :src="app.baseURL.replace(/.$/, '') + doc.image" :alt="doc.title" cover class="ma-16" />
      <ul>
        <template v-for="link of doc.body.toc.links">
          <li :key="link.id" v-if="link.depth === 2">
            <NuxtLink :to="`#${link.id}`">{{ link.text }}</NuxtLink>
          </li>
        </template>
      </ul>
      <ContentRenderer :value="doc" />
    </article>
  </ContentDoc>
</template>

<script lang="ts" setup>
const settings = useAppConfig()
const { app } = useRuntimeConfig()
</script>
