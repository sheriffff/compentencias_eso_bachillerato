<script setup>
import { ref, reactive, computed, watch } from 'vue'
import competenciasData from './data/competencias.json'
import CursoSelector from './components/CursoSelector.vue'
import EvalConfig from './components/EvalConfig.vue'
import FlagTable from './components/FlagTable.vue'
import { useExcelGenerator } from './composables/useExcelGenerator'

const { generateExcel } = useExcelGenerator()

const cursoSeleccionado = ref('')
let nextId = 1

const evaluaciones = reactive([
  { nombre: 'Evaluación 1', evaluables: [] },
  { nombre: 'Evaluación 2', evaluables: [] },
  { nombre: 'Evaluación 3', evaluables: [] }
])

const flagStore = reactive({})

const competencias = computed(() => {
  if (!cursoSeleccionado.value) return []
  return competenciasData[cursoSeleccionado.value]?.competencias || []
})

const flatSubcomps = computed(() => {
  const result = []
  for (const c of competencias.value) {
    for (const s of c.subcompetencias) {
      result.push({ comp: c.codigo, sub: s })
    }
  }
  return result
})

const hasEvaluables = computed(() =>
  evaluaciones.some(e => e.evaluables.length > 0)
)

watch(cursoSeleccionado, () => {
  evaluaciones.forEach(e => { e.evaluables = [] })
  Object.keys(flagStore).forEach(k => delete flagStore[k])
})

function addEvaluable(evalIdx) {
  const n = evaluaciones[evalIdx].evaluables.length + 1
  evaluaciones[evalIdx].evaluables.push({ id: nextId++, nombre: `Evaluable ${n}` })
}

function removeEvaluable(evalIdx, evIdx) {
  evaluaciones[evalIdx].evaluables.splice(evIdx, 1)
}

function renameEvaluable(evalIdx, evIdx, name) {
  evaluaciones[evalIdx].evaluables[evIdx].nombre = name
}

function getFlag(evalIdx, subIdx, evId) {
  return flagStore[`${evalIdx}-${subIdx}-${evId}`] ?? 0
}

function toggleFlag(evalIdx, subIdx, evId) {
  const key = `${evalIdx}-${subIdx}-${evId}`
  flagStore[key] = (flagStore[key] ?? 0) ? 0 : 1
}

function download() {
  const flagsArray = evaluaciones.map((ev, i) =>
    flatSubcomps.value.map((_, s) =>
      ev.evaluables.map(evaluable => getFlag(i, s, evaluable.id))
    )
  )
  generateExcel(cursoSeleccionado.value, competencias.value, evaluaciones, flagsArray)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-8">Evaluación por Competencias</h1>

      <CursoSelector v-model="cursoSeleccionado" />

      <template v-if="cursoSeleccionado">
        <EvalConfig
          :evaluaciones="evaluaciones"
          @add="addEvaluable"
          @remove="removeEvaluable"
          @rename="renameEvaluable"
        />

        <div v-if="hasEvaluables" class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">Flags por evaluación</h2>
          <FlagTable
            v-for="(ev, i) in evaluaciones"
            :key="i"
            :eval-index="i"
            :eval-nombre="ev.nombre"
            :evaluables="ev.evaluables"
            :subcompetencias="flatSubcomps"
            :get-flag="getFlag"
            :toggle-flag="toggleFlag"
          />
        </div>

        <button
          v-if="hasEvaluables"
          @click="download"
          class="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          Descargar Excel
        </button>
      </template>
    </div>
  </div>
</template>
