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

onMounted(() => {
  const { $pwa } = nuxtApp
  if ($pwa?.offlineReady) console.log('App ready to work offline')

  if (!$pwa?.isPWAInstalled) {
    console.log('PWA not installed')

    $pwa?.install().then(() => {
      console.log('PWA installed')
    })
  }
})
</script>
