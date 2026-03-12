<script setup>
defineProps({
  text: String
})
</script>

<template>
  <span class="relative group/tip">
    <slot />
    <span class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/tip:block bg-indigo-600 text-white text-sm rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg z-10 pointer-events-none">
      {{ text }}
    </span>
  </span>
</template>
