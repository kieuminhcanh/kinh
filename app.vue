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
const { $pwa } = useNuxtApp()

onMounted(() => {
  if (!$pwa?.isPWAInstalled) {
    console.log('PWA not installed')

    $pwa?.install().then(() => {
      console.log('PWA installed')
    })
  }
})
</script>
