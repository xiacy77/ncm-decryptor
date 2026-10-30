<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: [Number, String], default: 48 },
  petalColor: { type: String, default: '#f1d7d9' },
  centerColor: { type: String, default: '#d9b980' },
  petals: { type: Number, default: 7 },
  tilt: { type: Number, default: 0 },
})

const petalAngles = computed(() =>
  Array.from({ length: props.petals }, (_, index) => (360 / props.petals) * index),
)
</script>

<template>
  <svg
    class="watercolor-daisy"
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    :style="{ transform: `rotate(${tilt}deg)` }"
    aria-hidden="true"
  >
    <g class="petal-layer">
      <ellipse
        v-for="angle in petalAngles"
        :key="angle"
        cx="50"
        cy="27"
        rx="12"
        ry="19"
        :fill="petalColor"
        opacity="0.78"
        :transform="`rotate(${angle} 50 50)`"
      />
      <ellipse
        v-for="angle in petalAngles"
        :key="`inner-${angle}`"
        cx="50"
        cy="31"
        rx="8"
        ry="14"
        fill="#fff8ee"
        opacity="0.28"
        :transform="`rotate(${angle + 12} 50 50)`"
      />
    </g>
    <circle cx="50" cy="50" r="10.5" :fill="centerColor" opacity="0.88" />
    <circle cx="47" cy="47" r="3.2" fill="#fff8eb" opacity="0.62" />
  </svg>
</template>

<style scoped>
.watercolor-daisy {
  display: block;
  filter: blur(0.15px);
  overflow: visible;
  transform-origin: center;
}
</style>
