<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import data from './data/competencias.json'
import CursoSelector from './components/CursoSelector.vue'
import EvalConfig from './components/EvalConfig.vue'
import EscueliaWordmark from './components/EscueliaWordmark.vue'
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

function addEvaluable(evalIdx) {
  const existing = evaluaciones[evalIdx].evaluables
    .map(e => e.nombre.match(/^Exámen(\d+)$/))
    .filter(Boolean)
    .map(m => Number(m[1]))
  let n = 1
  while (existing.includes(n)) n++
  evaluaciones[evalIdx].evaluables.push({ id: nextId++, nombre: `Exámen${n}` })
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
  <div class="min-h-screen relative">
    <div class="absolute inset-0 -z-10">
      <div class="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary-200/30 blur-3xl" />
      <div class="absolute bottom-[10%] left-[-8%] w-[350px] h-[350px] rounded-full bg-accent-400/20 blur-3xl" />
    </div>

    <div class="max-w-6xl mx-auto px-6 py-6">
      <div class="flex items-center gap-4 mb-6 pb-5 border-b border-gray-200/70">
        <EscueliaWordmark size="1.75rem" />
        <div class="h-7 w-px bg-gray-300"></div>
        <span class="text-sm font-semibold text-gray-600">
          Evaluación por Competencias
        </span>
      </div>

      <div class="flex items-baseline justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-800">Evaluación por Competencias — Matemáticas</h1>
        <button @click="showHelp = true" class="px-4 py-2 rounded-lg text-sm font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors cursor-pointer whitespace-nowrap">Cómo usar esta web</button>
      </div>

      <CursoSelector v-model="cursoSeleccionado" />

      <div v-if="showHelp" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showHelp = false">
        <div class="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
          <h2 class="text-lg font-bold text-gray-800 mb-3">Cómo usar</h2>
          <ol class="list-decimal list-inside text-lg text-gray-700 space-y-3">
            <li>Elige el curso.</li>
            <li>Configura los evaluables de cada evaluación.</li>
            <li>Descarga el Excel.</li>
            <li>Sigue las instrucciones en la primera hoja del Excel.</li>
          </ol>
          <button @click="showHelp = false" class="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 cursor-pointer">Cerrar</button>
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
    <Analytics />
    <SpeedInsights />
  </div>
</template>
