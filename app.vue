<template>
  <VApp>
    <VMain>
      <VContainer>
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

onMounted(() => {
  const $pwa = nuxtApp.$pwa
  if (!$pwa?.isPWAInstalled) {
    console.log('PWA not installed')

    $pwa?.install().then(() => {
      console.log('PWA installed')
    })
  }
})
</script>
