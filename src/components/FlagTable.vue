<script setup>
defineProps({
  evaluaciones: Array,
  subcompetencias: Array,
  getFlag: Function,
  toggleFlag: Function
})
</script>

<template>
  <div class="mb-8">
    <h2 class="text-lg font-semibold text-gray-700 mb-4">Flags por evaluación</h2>
    <div class="overflow-x-auto">
      <table class="border-collapse text-sm bg-white rounded shadow-sm">
        <thead>
          <tr>
            <th class="border border-gray-200 px-3 py-2 bg-gray-50" rowspan="2">Comp.</th>
            <th class="border border-gray-200 px-3 py-2 bg-gray-50" rowspan="2">Sub.</th>
            <template v-for="(ev, i) in evaluaciones" :key="'h-'+i">
              <th
                v-if="ev.evaluables.length"
                :colspan="ev.evaluables.length"
                class="border border-gray-200 px-3 py-2 bg-indigo-600 text-white text-center font-semibold"
              >
                {{ ev.nombre }}
              </th>
              <th
                v-if="ev.evaluables.length && i < evaluaciones.length - 1"
                rowspan="2"
                class="border-none w-2"
              ></th>
            </template>
          </tr>
          <tr>
            <template v-for="(ev, i) in evaluaciones" :key="'s-'+i">
              <th
                v-for="evaluable in ev.evaluables"
                :key="evaluable.id"
                class="border border-gray-200 px-3 py-2 bg-gray-50 text-center text-gray-600 min-w-[80px]"
              >
                {{ evaluable.nombre }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sc, sIdx) in subcompetencias" :key="sIdx">
            <td class="border border-gray-200 px-3 py-1.5 font-medium text-gray-700">{{ sc.compCodigo }}</td>
            <td class="border border-gray-200 px-3 py-1.5 text-gray-600">{{ sc.subCodigo }}</td>
            <template v-for="(ev, i) in evaluaciones" :key="'d-'+i">
              <td
                v-for="evaluable in ev.evaluables"
                :key="evaluable.id"
                class="border border-gray-200 px-3 py-1.5 text-center cursor-pointer select-none transition-colors"
                :class="getFlag(i, sIdx, evaluable.id) ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-white text-gray-300 hover:bg-gray-50'"
                @click="toggleFlag(i, sIdx, evaluable.id)"
              >
                {{ getFlag(i, sIdx, evaluable.id) }}
              </td>
              <td
                v-if="ev.evaluables.length && i < evaluaciones.length - 1"
                class="border-none w-2"
              ></td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
