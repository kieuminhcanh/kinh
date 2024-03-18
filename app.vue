<template>
  <VApp>
    <VMain>
      <VContainer>
        <VitePwaManifest />
        <NuxtPage />
      </VContainer>
    </VMain>
  </VApp>
</template>

<script lang="ts" setup>
const nuxtApp = useNuxtApp()

nuxtApp.hook('page:finish', () => {
  window.scrollTo(0, 0)  
})
</script>
