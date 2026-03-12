<script setup>
import { ref } from 'vue'

defineProps({
  evaluaciones: Array
})

const emit = defineEmits(['add', 'remove', 'rename', 'reorder'])

const dragEval = ref(null)
const dragIdx = ref(null)
const overIdx = ref(null)

function onDragStart(evalIndex, j) {
  dragEval.value = evalIndex
  dragIdx.value = j
}

function onDragOver(e, evalIndex, j) {
  if (dragEval.value !== evalIndex) return
  e.preventDefault()
  overIdx.value = j
}

function onDrop(evalIndex) {
  if (dragEval.value !== evalIndex || dragIdx.value === null || overIdx.value === null) return
  if (dragIdx.value !== overIdx.value) {
    emit('reorder', evalIndex, dragIdx.value, overIdx.value)
  }
  dragEval.value = null
  dragIdx.value = null
  overIdx.value = null
}

function onDragEnd() {
  dragEval.value = null
  dragIdx.value = null
  overIdx.value = null
}
</script>

<template>
  <div class="mb-8">
    <h2 class="text-lg font-semibold text-gray-700 mb-4">Configurar evaluables</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="(ev, i) in evaluaciones"
        :key="i"
        class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
        @drop="onDrop(i)"
        @dragover.prevent
      >
        <h3 class="font-medium text-gray-800 mb-3">{{ ev.nombre }}</h3>
        <div
          v-for="(evaluable, j) in ev.evaluables"
          :key="evaluable.id"
          draggable="true"
          @dragstart="onDragStart(i, j)"
          @dragover="onDragOver($event, i, j)"
          @dragend="onDragEnd"
          class="flex items-center gap-2 mb-2 rounded transition-colors"
          :class="dragEval === i && overIdx === j ? 'bg-indigo-50' : ''"
        >
          <span class="cursor-grab text-gray-400 hover:text-gray-600 text-sm select-none">⠿</span>
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
        <div class="flex gap-3 mt-2">
          <button
            v-for="tipo in ['Examen', 'Cuaderno', 'Trabajo']"
            :key="tipo"
            @click="emit('add', i, tipo)"
            class="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            + {{ tipo }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
