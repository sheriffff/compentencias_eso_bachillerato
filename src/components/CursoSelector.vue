<script setup>
import { computed } from 'vue'
import data from '../data/competencias.json'
import Tooltip from './Tooltip.vue'

const model = defineModel()

const cursos = [
  { key: '1ESO', label: '1º ESO' },
  { key: '2ESO', label: '2º ESO' },
  { key: '3ESO', label: '3º ESO' },
  { key: '4ESO', label: '4º ESO' },
  { key: '1BACH', label: '1º Bach' },
  { key: '2BACH', label: '2º Bach' }
]

const comps = data.competencias

const cursoComps = computed(() => {
  if (!model.value) return []
  const curso = data.cursos[model.value]
  if (!curso) return []
  return Object.entries(curso).map(([codigo, subs]) => ({
    codigo,
    nombre: comps[codigo].nombre,
    subcompetencias: subs.map(s => ({
      codigo: s,
      nombre: comps[codigo].subcompetencias[s]
    }))
  }))
})
</script>

<template>
  <div class="mb-8">
    <label class="block text-sm font-semibold text-gray-700 mb-3">Curso</label>
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="c in cursos"
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

    <p v-if="model" class="text-sm text-gray-500 mb-2">Competencias y subcompetencias de {{ cursos.find(c => c.key === model)?.label }}</p>
    <div v-if="cursoComps.length" class="bg-white border border-gray-200 rounded-lg p-4">
      <div
        v-for="comp in cursoComps"
        :key="comp.codigo"
        class="grid gap-x-4 mb-1.5 last:mb-0 items-baseline text-base"
        style="grid-template-columns: 1.5ch 5ch 1fr"
      >
        <span class="text-right text-gray-500">{{ comp.subcompetencias[0]?.codigo.split('.')[0] }}</span>
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
