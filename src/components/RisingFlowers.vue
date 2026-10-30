<script setup>
import WatercolorDaisy from '@/components/WatercolorDaisy.vue'

defineProps({
  active: { type: Boolean, default: false },
})

const flowers = [
  { left: 9, size: 33, delay: 0.2, drift: 34, duration: 7.4, rotate: -18, color: '#f0d5dc' },
  { left: 17, size: 22, delay: 1.5, drift: -48, duration: 8.6, rotate: 24, color: '#f6e9dc' },
  { left: 26, size: 38, delay: 0.7, drift: 60, duration: 7.8, rotate: -9, color: '#eadfeb' },
  { left: 37, size: 26, delay: 2.1, drift: -22, duration: 9.1, rotate: 33, color: '#f7e7dd' },
  { left: 46, size: 44, delay: 0.1, drift: -54, duration: 8.2, rotate: -27, color: '#f0d3d8' },
  { left: 54, size: 28, delay: 2.5, drift: 46, duration: 9.4, rotate: 17, color: '#f6eee1' },
  { left: 63, size: 36, delay: 1.1, drift: -34, duration: 7.6, rotate: -14, color: '#e9ddeb' },
  { left: 71, size: 24, delay: 0.5, drift: 26, duration: 8.8, rotate: 29, color: '#f2d6dd' },
  { left: 79, size: 41, delay: 1.9, drift: -45, duration: 8.1, rotate: -22, color: '#f8ebe0' },
  { left: 88, size: 30, delay: 0.9, drift: 37, duration: 9.6, rotate: 12, color: '#eadfeb' },
  { left: 33, size: 20, delay: 3, drift: 54, duration: 10, rotate: -32, color: '#f6eee1' },
  { left: 58, size: 19, delay: 2.8, drift: -31, duration: 9.7, rotate: 20, color: '#f2d6dd' },
  { left: 95, size: 23, delay: 1.7, drift: -26, duration: 8.9, rotate: -17, color: '#f6e9dc' },
]
</script>

<template>
  <div class="rising-flowers" :class="{ active }" aria-hidden="true">
    <div
      v-for="(flower, index) in flowers"
      :key="index"
      class="rising-flower"
      :style="{
        left: `${flower.left}%`,
        '--size': `${flower.size}px`,
        '--delay': `${flower.delay}s`,
        '--drift': `${flower.drift}px`,
        '--duration': `${flower.duration}s`,
        '--rotate': `${flower.rotate}deg`,
      }"
    >
      <WatercolorDaisy
        :size="flower.size"
        :petal-color="flower.color"
        center-color="#d9ba83"
        :petals="7"
      />
    </div>
  </div>
</template>

<style scoped>
.rising-flowers {
  position: absolute;
  inset: 0;
  z-index: 6;
  overflow: hidden;
  pointer-events: none;
}

.rising-flower {
  position: absolute;
  bottom: -10vh;
  width: var(--size);
  height: var(--size);
  opacity: 0;
  filter: drop-shadow(0 10px 18px rgba(187, 151, 160, 0.14));
  transform: translate3d(0, 0, 0) rotate(var(--rotate));
}

.rising-flowers.active .rising-flower {
  animation: rise-and-drift var(--duration) cubic-bezier(0.22, 0.61, 0.36, 1) var(--delay)
    both;
}

@keyframes rise-and-drift {
  0% {
    opacity: 0;
    transform: translate3d(0, 10vh, 0) rotate(var(--rotate)) scale(0.7);
  }
  12% {
    opacity: 0.82;
  }
  58% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--drift), -105vh, 0) rotate(calc(var(--rotate) + 80deg))
      scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rising-flowers.active .rising-flower {
    animation-duration: 14s;
  }
}
</style>
