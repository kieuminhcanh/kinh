<template>
  <VLayout>
    <VMain>
      <v-app-bar theme="dark" color="#545c64">
        <template #prepend>
          <v-app-bar-nav-icon icon="mdi-home" @click="$router.push('/')"></v-app-bar-nav-icon>
        </template>
        <template #append>
          <v-slide-x-transition group>
            <template v-if="$route.name === 'index'">
              <v-btn icon="mdi-table-column" @click="settings.gridColumns = 1"></v-btn>
              <v-btn icon="mdi-grid-large" @click="settings.gridColumns = 2"></v-btn>
              <v-btn icon="mdi-grid" @click="settings.gridColumns = 3"></v-btn>
            </template>
            <template v-else>
              <v-btn icon>
                <v-icon>mdi-palette-outline</v-icon>
                <v-menu activator="parent">
                  <v-sheet theme="light">
                    <v-btn v-for="item in colors" :color="item" icon="mdi-radiobox-blank" @click="settings.colorReading = item" class="ma-2"></v-btn>
                  </v-sheet>
                </v-menu>
              </v-btn>
              <v-btn icon="mdi-format-font-size-decrease" @click="settings.fontSize--"></v-btn>
              <v-btn icon="mdi-format-font-size-increase" @click="settings.fontSize++"></v-btn>
            </template>
          </v-slide-x-transition>
        </template>
      </v-app-bar>
      <VContainer>
        <NuxtPage />
      </VContainer>
    </VMain>
  </VLayout>
</template>

<script lang="ts" setup>
const settings = useAppConfig()

const colors = ['#f5e4e4', '#f5ebcd', '#e2eee2', '#e1e8e8', '#eae4d3', '#e5e3df', '#ffffff']

watch(settings, async (value, oldValue) => {
  console.log(value)
})
</script>
