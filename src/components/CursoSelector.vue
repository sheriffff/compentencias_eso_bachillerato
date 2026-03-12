<script setup>
import competencias from '../data/competencias.json'

const model = defineModel()
const cursos = Object.keys(competencias)
</script>

<template>
  <div class="mb-8">
    <label class="block text-sm font-semibold text-gray-700 mb-2">Curso</label>
    <select
      v-model="model"
      class="w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="" disabled>-- Elige curso --</option>
      <option v-for="c in cursos" :key="c" :value="c">{{ c }}</option>
    </select>
  </div>
</template>
