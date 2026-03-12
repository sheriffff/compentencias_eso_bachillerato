<script setup>
import { computed } from 'vue'
import data from '../data/competencias.json'
import Tooltip from './Tooltip.vue'

const model = defineModel()

const labels = {
  '1ESO': '1º ESO', '2ESO': '2º ESO', '3ESO': '3º ESO',
  '4ESO-A': '4º ESO (A)', '4ESO-B': '4º ESO (B)',
  '1BACH-C': '1º Bach (Ciencias)', '2BACH-C': '2º Bach (Ciencias)',
  '1BACH-S': '1º Bach (Sociales)', '2BACH-S': '2º Bach (Sociales)'
}
const allCursos = Object.keys(data.cursos).map(key => ({ key, label: labels[key] || key }))
const cursosESO = allCursos.filter(c => c.key.includes('ESO'))
const cursosBACH = allCursos.filter(c => c.key.includes('BACH'))

const cursoComps = computed(() => {
  if (!model.value) return []
  const cursoData = data.cursos[model.value]
  if (!cursoData) return []
  const { etapa, mapa } = cursoData
  const critKey = data.criterios[model.value] ? model.value : etapa
  return Object.entries(data.competencias[etapa]).map(([ce, comp]) => ({
    codigo: ce,
    nombre: comp.nombre,
    subcompetencias: (mapa[ce] || []).map(c => ({
      codigo: c,
      nombre: data.criterios[critKey][c]
    }))
  }))
})
</script>

<template>
  <div class="mb-8">
    <label class="block text-sm font-semibold text-gray-700 mb-3">Curso</label>
    <div class="flex flex-wrap gap-2 mb-2">
      <button
        v-for="c in cursosESO"
        :key="c.key"
        @click="model = c.key"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        :class="model === c.key
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'"
      >
        {{ c.label }}
      </button>
    </div>
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="c in cursosBACH"
        :key="c.key"
        @click="model = c.key"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        :class="model === c.key
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'"
      >
        {{ c.label }}
      </button>
    </div>

    <p v-if="model" class="text-sm text-gray-500 mb-2">Competencias específicas y criterios de evaluación de {{ allCursos.find(c => c.key === model)?.label }}</p>
    <div v-if="cursoComps.length" class="bg-white border border-gray-200 rounded-lg p-4">
      <div
        v-for="comp in cursoComps"
        :key="comp.codigo"
        class="grid gap-x-4 mb-1.5 last:mb-0 items-baseline text-base"
        style="grid-template-columns: 2.5ch 4ch 1fr"
      >
        <span class="text-right text-gray-500">{{ comp.codigo.replace('CE', '') }}</span>
        <Tooltip :text="comp.nombre">
          <span class="font-bold text-indigo-600 cursor-default">{{ comp.codigo }}</span>
        </Tooltip>
        <span class="text-gray-900 flex gap-3">
          <Tooltip v-for="s in comp.subcompetencias" :key="s.codigo" :text="s.nombre">
            <span class="cursor-default">{{ s.codigo }}</span>
          </Tooltip>
        </span>
      </div>
    </div>
  </div>
</template>
