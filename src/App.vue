<script setup>
import { ref, reactive, computed, watch } from 'vue'
import data from './data/competencias.json'
import CursoSelector from './components/CursoSelector.vue'
import EvalConfig from './components/EvalConfig.vue'
import EscueliaWordmark from './components/EscueliaWordmark.vue'
import { useExcelGenerator } from './composables/useExcelGenerator'

const { generateExcel } = useExcelGenerator()

const started = ref(false)
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
  <div v-if="!started" class="min-h-screen relative overflow-hidden">
    <div class="absolute inset-0 -z-10">
      <div class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-200/40 blur-3xl" />
      <div class="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-accent-400/30 blur-3xl" />
    </div>

    <div class="max-w-5xl mx-auto px-6 pt-20 pb-12">
      <div class="text-center mb-12">
        <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
          Evaluación por<br />
          <span class="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">Competencias LOMLOE</span>
        </h1>
        <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
          Configura tus evaluaciones y descarga un Excel listo para llevar el seguimiento por criterios y competencias.
        </p>
      </div>

      <div class="flex justify-center mb-16">
        <button
          @click="started = true"
          class="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-2xl text-base font-bold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35 hover:from-primary-500 hover:to-accent-400 transition-all duration-200 overflow-hidden cursor-pointer"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <svg class="w-5 h-5 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span class="relative">Empezar</span>
        </button>
      </div>

      <div class="grid md:grid-cols-2 gap-5 mb-16 max-w-3xl mx-auto">
        <div class="glass rounded-2xl p-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center mb-3 text-lg font-bold">1</div>
          <h3 class="font-bold text-neutral-900 mb-1">Elige curso y evaluables</h3>
          <p class="text-sm text-neutral-600">Selecciona tu curso y añade los exámenes o tareas de cada evaluación.</p>
        </div>
        <div class="glass rounded-2xl p-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white flex items-center justify-center mb-3 text-lg font-bold">2</div>
          <h3 class="font-bold text-neutral-900 mb-1">Descarga tu Excel</h3>
          <p class="text-sm text-neutral-600">Un libro con todos los criterios mapeados y listo para rellenar notas.</p>
        </div>
      </div>

      <div class="flex items-baseline justify-center gap-2 mt-16 text-xl text-neutral-500 whitespace-nowrap">
        <span class="cursor-default select-none">creado por</span>
        <EscueliaWordmark size="2rem" />
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen relative">
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
  </div>
</template>
