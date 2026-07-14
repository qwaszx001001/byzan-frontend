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
    class="group flex flex-col justify-between bg-white border border-gray-200 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
  >
    <div>
      <div class="relative h-52 overflow-hidden">
        <img
          :src="article.thumbnail || article.featured_image || article.image || articleImages[article.imageIndex || 0]"
          :alt="article.title"
          class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <!-- subtle gradient for badge legibility -->
        <div class="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent"></div>
        <span
          class="absolute top-3 right-3 px-3 py-1 text-xs font-bold text-black bg-[#65FB5F] rounded-full shadow-sm"
        >
          {{ displayCategoryName(article.category) }}
        </span>
      </div>
      <div class="p-5 flex flex-col">
        <h3
          class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug"
          v-html="article.title"
        ></h3>
        <p class="text-sm text-gray-600 line-clamp-3 leading-relaxed">{{ article.excerpt }}</p>
      </div>
    </div>
    <footer
      class="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span class="truncate">{{ article.date || "19 Juli 2025" }}</span>
        <span class="text-gray-300">·</span>
        <span class="whitespace-nowrap">{{ article.comments || 0 }} Komentar</span>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <img :src="starIconSrc" alt="Rating" class="w-4 h-4" />
        <span class="font-semibold text-gray-700">{{ article.rating || 4.8 }}</span>
      </div>
    </footer>
  </router-link>
</template>