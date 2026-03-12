<script setup>
defineProps({
  evaluaciones: Array
})

const emit = defineEmits(['add', 'remove', 'rename'])
</script>

<template>
  <div class="mb-8">
    <h2 class="text-lg font-semibold text-gray-700 mb-4">Configurar evaluables</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="(ev, i) in evaluaciones"
        :key="i"
        class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
      >
        <h3 class="font-medium text-gray-800 mb-3">{{ ev.nombre }}</h3>
        <div
          v-for="(evaluable, j) in ev.evaluables"
          :key="evaluable.id"
          class="flex items-center gap-2 mb-2"
        >
          <input
            :value="evaluable.nombre"
            @input="emit('rename', i, j, $event.target.value)"
            class="border border-gray-300 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <button
            @click="emit('remove', i, j)"
            class="text-red-400 hover:text-red-600 text-lg leading-none px-1"
          >
            &times;
          </button>
        </div>
        <button
          @click="emit('add', i)"
          class="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-1"
        >
          + Evaluable
        </button>
      </div>
    </div>
  </div>
</template>
