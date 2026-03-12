<script setup>
defineProps({
  evalIndex: Number,
  evalNombre: String,
  evaluables: Array,
  subcompetencias: Array,
  getFlag: Function,
  toggleFlag: Function
})
</script>

<template>
  <div v-if="evaluables.length > 0" class="mb-6">
    <h3 class="font-medium text-gray-700 mb-2">{{ evalNombre }}</h3>
    <div class="overflow-x-auto">
      <table class="border-collapse text-sm bg-white rounded shadow-sm">
        <thead>
          <tr>
            <th class="border border-gray-200 px-3 py-2 bg-gray-50 text-left text-gray-600">Comp.</th>
            <th class="border border-gray-200 px-3 py-2 bg-gray-50 text-left text-gray-600">Sub.</th>
            <th
              v-for="ev in evaluables"
              :key="ev.id"
              class="border border-gray-200 px-3 py-2 bg-gray-50 text-center text-gray-600 min-w-[80px]"
            >
              {{ ev.nombre }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sc, sIdx) in subcompetencias" :key="sIdx">
            <td class="border border-gray-200 px-3 py-1.5 font-medium text-gray-700">{{ sc.comp }}</td>
            <td class="border border-gray-200 px-3 py-1.5 text-gray-600">{{ sc.sub }}</td>
            <td
              v-for="ev in evaluables"
              :key="ev.id"
              class="border border-gray-200 px-3 py-1.5 text-center cursor-pointer select-none transition-colors"
              :class="getFlag(evalIndex, sIdx, ev.id) ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-white text-gray-300 hover:bg-gray-50'"
              @click="toggleFlag(evalIndex, sIdx, ev.id)"
            >
              {{ getFlag(evalIndex, sIdx, ev.id) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
