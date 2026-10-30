<script setup>
import { computed } from 'vue'
import { rand } from '@/utils/math'

const props = defineProps({
  active: { type: Boolean, default: true },
  density: { type: Number, default: 1 },
})

const palette = ['#f0c5d3', '#efd4df', '#f7e3d5', '#dfbed2', '#fae8dd']

const sakuraPetals = Array.from({ length: Math.round(24 * props.density) }, (_, index) => ({
  id: `petal-${index}`,
  left: rand(0, 100),
  size: rand(7, 15),
  duration: rand(14, 30),
  delay: rand(-32, 0),
  drift: rand(-90, 110),
  tilt: rand(0, 180),
  sway: rand(1.4, 3.6),
  color: palette[index % palette.length],
  blur: rand(0, 0.8),
}))

const seeds = Array.from({ length: Math.round(10 * props.density) }, (_, index) => ({
  id: `seed-${index}`,
  left: rand(0, 100),
  size: rand(11, 23),
  duration: rand(18, 34),
  delay: rand(-34, 0),
  drift: rand(-70, 70),
  tilt: rand(-35, 35),
  opacity: rand(0.25, 0.65),
}))

const rootClass = computed(() => ({ 'is-active': props.active }))
</script>

<template>
  <div class="petal-field" :class="rootClass" aria-hidden="true">
    <span
      v-for="petal in sakuraPetals"
      :key="petal.id"
      class="sakura-petal"
      :style="{
        left: `${petal.left}%`,
        '--petal-size': `${petal.size}px`,
        '--fall-duration': `${petal.duration}s`,
        '--fall-delay': `${petal.delay}s`,
        '--drift': `${petal.drift}px`,
        '--tilt': `${petal.tilt}deg`,
        '--sway': `${petal.sway}s`,
        '--petal-color': petal.color,
        filter: `blur(${petal.blur}px)`,
      }"
    ></span>

    <span
      v-for="seed in seeds"
      :key="seed.id"
      class="dandelion-seed"
      :style="{
        left: `${seed.left}%`,
        '--seed-size': `${seed.size}px`,
        '--fall-duration': `${seed.duration}s`,
        '--fall-delay': `${seed.delay}s`,
        '--drift': `${seed.drift}px`,
        '--tilt': `${seed.tilt}deg`,
        opacity: seed.opacity,
      }"
    >
      <svg viewBox="0 0 48 72" width="100%" height="100%">
        <g fill="none" stroke="rgba(255, 252, 243, 0.9)" stroke-width="0.8" stroke-linecap="round">
          <line x1="24" y1="31" x2="24" y2="65" />
          <line x1="24" y1="29" x2="10" y2="13" />
          <line x1="24" y1="29" x2="19" y2="9" />
          <line x1="24" y1="29" x2="29" y2="8" />
          <line x1="24" y1="29" x2="39" y2="14" />
          <line x1="24" y1="29" x2="13" y2="21" />
          <line x1="24" y1="29" x2="36" y2="21" />
        </g>
        <circle cx="24" cy="30" r="1.4" fill="rgba(255, 251, 242, 0.95)" />
        <circle cx="10" cy="13" r="1.3" fill="rgba(255, 252, 245, 0.85)" />
        <circle cx="19" cy="9" r="1.1" fill="rgba(255, 252, 245, 0.8)" />
        <circle cx="29" cy="8" r="1.3" fill="rgba(255, 252, 245, 0.8)" />
        <circle cx="39" cy="14" r="1.2" fill="rgba(255, 252, 245, 0.8)" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
.petal-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 4;
  opacity: 0;
  transition: opacity 2.8s ease;
}

.petal-field.is-active {
  opacity: 1;
}

.sakura-petal {
  position: absolute;
  top: -8vh;
  width: var(--petal-size);
  height: calc(var(--petal-size) * 0.72);
  border-radius: 85% 8% 78% 10%;
  background: var(--petal-color);
  box-shadow:
    0 0 8px rgba(255, 240, 235, 0.34),
    0 0 16px rgba(246, 200, 210, 0.12);
  opacity: 0.6;
  animation:
    petal-fall var(--fall-duration) linear infinite,
    petal-sway var(--sway) ease-in-out infinite alternate;
  animation-delay: var(--fall-delay), var(--fall-delay);
  will-change: transform;
}

.sakura-petal:nth-child(3n) {
  opacity: 0.44;
}

.sakura-petal:nth-child(4n) {
  opacity: 0.7;
}

.dandelion-seed {
  position: absolute;
  top: -10vh;
  width: var(--seed-size);
  height: calc(var(--seed-size) * 1.5);
  animation: seed-fall var(--fall-duration) linear infinite;
  animation-delay: var(--fall-delay);
  will-change: transform;
}

@keyframes petal-fall {
  0% {
    transform: translate3d(0, -8vh, 0) rotate(var(--tilt));
  }
  100% {
    transform: translate3d(var(--drift), 116vh, 0) rotate(calc(var(--tilt) + 420deg));
  }
}

@keyframes petal-sway {
  from {
    margin-left: -14px;
  }
  to {
    margin-left: 14px;
  }
}

@keyframes seed-fall {
  0% {
    transform: translate3d(0, -10vh, 0) rotate(var(--tilt));
  }
  100% {
    transform: translate3d(var(--drift), 118vh, 0) rotate(calc(var(--tilt) + 85deg));
  }
}

@media (prefers-reduced-motion: reduce) {
  .sakura-petal,
  .dandelion-seed {
    animation-duration: 55s;
  }
}
</style>
