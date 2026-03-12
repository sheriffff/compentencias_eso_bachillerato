<script setup>
import { ref, reactive, computed, watch } from 'vue'
import data from './data/competencias.json'
import CursoSelector from './components/CursoSelector.vue'
import EvalConfig from './components/EvalConfig.vue'
import { useExcelGenerator } from './composables/useExcelGenerator'

const { generateExcel } = useExcelGenerator()

const cursoSeleccionado = ref('')
const showHelp = ref(false)
let nextId = 1

const evaluaciones = reactive([
  { nombre: 'Evaluación 1', evaluables: [] },
  { nombre: 'Evaluación 2', evaluables: [] },
  { nombre: 'Evaluación 3', evaluables: [] }
])

const flatSubcomps = computed(() => {
  const cursoData = data.cursos[cursoSeleccionado.value]
  if (!cursoData) return []
  const { etapa, mapa } = cursoData
  const critKey = data.criterios[cursoSeleccionado.value] ? cursoSeleccionado.value : etapa
  const result = []
  for (const [ce, crits] of Object.entries(mapa)) {
    for (const code of crits) {
      result.push({
        compCodigo: ce,
        compNombre: data.competencias[etapa][ce].nombre,
        subCodigo: code,
        subNombre: data.criterios[critKey][code]
      })
    }
  }
  return result
})

const hasEvaluables = computed(() =>
  evaluaciones.some(e => e.evaluables.length > 0)
)

watch(cursoSeleccionado, () => {
  evaluaciones.forEach(e => { e.evaluables = [] })
})

function addEvaluable(evalIdx, tipo) {
  const count = evaluaciones[evalIdx].evaluables.filter(e => e.tipo === tipo).length + 1
  const prefijos = { Examen: 'Ex', Cuaderno: 'C', Trabajo: 'T' }
  const nombre = `${prefijos[tipo]}${count}`
  evaluaciones[evalIdx].evaluables.push({ id: nextId++, nombre, tipo })
}

function removeEvaluable(evalIdx, evIdx) {
  evaluaciones[evalIdx].evaluables.splice(evIdx, 1)
}

function renameEvaluable(evalIdx, evIdx, name) {
  evaluaciones[evalIdx].evaluables[evIdx].nombre = name
}

function reorderEvaluable(evalIdx, from, to) {
  const list = evaluaciones[evalIdx].evaluables
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item)
}

function download() {
  const flagsArray = evaluaciones.map(ev =>
    flatSubcomps.value.map(() =>
      ev.evaluables.map(() => 0)
    )
  )
  generateExcel(cursoSeleccionado.value, flatSubcomps.value, evaluaciones, flagsArray)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-baseline justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-800">Evaluación por Competencias — Matemáticas</h1>
        <button @click="showHelp = true" class="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors cursor-pointer whitespace-nowrap">Cómo usar esta web</button>
      </div>

      <CursoSelector v-model="cursoSeleccionado" />

      <div v-if="showHelp" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showHelp = false">
        <div class="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
          <h2 class="text-lg font-bold text-gray-800 mb-3">Cómo usar</h2>
          <ol class="list-decimal list-inside text-sm text-gray-700 space-y-2">
            <li>Elige el curso.</li>
            <li>Configura los evaluables (exámenes, cuadernos, trabajos) de cada evaluación.</li>
            <li>Descarga el Excel.</li>
            <li>En la hoja "Competencias y Criterios", rellena los flags (0/1) para indicar qué evaluable evalúa cada criterio.</li>
            <li>En la hoja "Notas Evaluables", pon las notas de cada alumno. Las medias y competencias se calculan solas.</li>
          </ol>
          <button @click="showHelp = false" class="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer">Cerrar</button>
        </div>
      </div>

      <template v-if="cursoSeleccionado">
        <EvalConfig
          :evaluaciones="evaluaciones"
          @add="addEvaluable"
          @remove="removeEvaluable"
          @rename="renameEvaluable"
          @reorder="reorderEvaluable"
        />

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
