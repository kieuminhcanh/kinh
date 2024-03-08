<template>
  <VLayout>
    <VMain>
      <VContainer>
        <NuxtPage />
      </VContainer>
    </VMain>
  </VLayout>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: 'Kinh tụng mỗi ngày',
  ogTitle: 'Kinh tụng',
  description: 'Nam mô bổn sư Thích Ca Mâu Ni Phật.',
  ogDescription: 'Nam mô bổn sư Thích Ca Mâu Ni Phật.',
  ogImage: 'https://kieuminhcanh.github.io/kinh/images/kinh-dieu-phap-lien-hoa.jpg',
  twitterCard: 'summary_large_image',
})
</script>
