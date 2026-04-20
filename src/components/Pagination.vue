<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  itemsPerPageOptions: {
    type: Array,
    default: () => [10, 25, 50, 100]
  }
})

// Emits
const emit = defineEmits(['update:currentPage', 'update:itemsPerPage'])

// Computed properties
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(props.totalPages, start + maxVisible - 1)

  // Adjust start if we're near the end
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const canGoToPrevious = computed(() => props.currentPage > 1)
const canGoToNext = computed(() => props.currentPage < props.totalPages)

// Methods
const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
  }
}

const goToPrevious = () => {
  if (canGoToPrevious.value) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

const goToNext = () => {
  if (canGoToNext.value) {
    emit('update:currentPage', props.currentPage + 1)
  }
}

const updateItemsPerPage = (value) => {
  const newValue = parseInt(value)
  emit('update:itemsPerPage', newValue)
  // Reset to first page when changing items per page
  emit('update:currentPage', 1)
}
</script>

<template>
  <nav aria-label="Pagination Navigation" class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
    <!-- Page Numbers -->
    <ul class="flex -space-x-px text-sm">
      <!-- Previous Button -->
      <li>
        <button
          @click="goToPrevious"
          :disabled="!canGoToPrevious"
          class="flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 font-medium leading-5 rounded-l-lg text-sm px-3 h-9 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          Previous
        </button>
      </li>

      <!-- Page Numbers -->
      <li v-for="page in visiblePages" :key="page">
        <button
          @click="goToPage(page)"
          :class="[
            'flex items-center justify-center border font-medium text-sm w-9 h-9 focus:border-green-500',
            page === currentPage
              ? 'text-white bg-green-600 border-green-600 hover:bg-green-700'
              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          {{ page }}
        </button>
      </li>

      <!-- Next Button -->
      <li>
        <button
          @click="goToNext"
          :disabled="!canGoToNext"
          class="flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 font-medium leading-5 rounded-r-lg text-sm px-3 h-9 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          Next
        </button>
      </li>
    </ul>

    <!-- Items Per Page Selector -->
    <div class="flex items-center space-x-2">
      <label for="itemsPerPage" class="text-sm text-gray-700 font-medium">
        Items per page:
      </label>
      <select
        id="itemsPerPage"
        :value="itemsPerPage"
        @change="updateItemsPerPage($event.target.value)"
        class="block px-3 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 focus:outline-none"
      >
        <option
          v-for="option in itemsPerPageOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>

    <!-- Page Info -->
    <div class="text-sm text-gray-700">
      Page {{ currentPage }} of {{ totalPages }}
    </div>
  </nav>
</template>