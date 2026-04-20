<script setup>
import { getAssetUrl } from "../../utils/assets";

defineProps({
  article: {
    type: Object,
    required: true,
  },
  articleImages: {
    type: Array,
    required: true,
  },
  displayCategoryName: {
    type: Function,
    required: true,
  },
  getCategoryColor: {
    type: Function,
    required: false,
  },
  isPost: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const starIconSrc = getAssetUrl("ae82f0fc275cc9614de9be18a7b57f7d24b16b0d.png");
</script>

<template>
  <router-link
    :to="{ name: 'byzanpost-details', params: { id: article.id } }"
    class="flex flex-col justify-between bg-white border border-gray-200 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-md transition-transform "
  >
    <div>
      <div class="relative h-60 overflow-hidden">
      <img
        :src="article.thumbnail || article.featured_image || article.image || articleImages[article.imageIndex || 0]"
        :alt="article.title"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <span
        class="absolute top-0 right-0 px-4 py-2 text-sm font-semibold text-white bg-[#65FB5F]"
      >
        {{ displayCategoryName(article.category) }}
      </span>
    </div>
    <div class="p-6 flex flex-col">
      <h3
        class="text-lg font-semibold mb-3! line-clamp-3"
        v-html="article.title"
      ></h3>
      <p class="text-sm text-gray-600 flex-1">{{ article.excerpt }}</p>
    </div>
    </div>
    <footer
      class="p-6 border-t border-gray-300 flex items-center justify-between text-base text-primary"
    >
      <div>
        {{ article.date || "19 Juli 2025" }} <span class="mx-2">|</span>
        {{ article.comments || 0 }} Comments
      </div>
      <div class="flex items-center gap-2">
        <span class="font-semibold">{{ article.rating || 4.8 }}</span>
        <img :src="starIconSrc" alt="Star" class="w-6" />
      </div>
    </footer>
  </router-link>
</template>
