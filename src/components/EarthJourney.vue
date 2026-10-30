<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import china from '@/assets/geo/china.json'
import world from '@/assets/geo/world-land.json'
import { JOURNEY_CITIES, TIMING, UI } from '@/config/story'

const VIEW = 500
const CENTER = VIEW / 2
const BASE_RADIUS = 205
const MIN_PHI = -68
const MAX_PHI = 68

const globeEl = ref(null)
const rotation = ref([-104, -26, 0])
const dragging = ref(false)
const hasDragged = ref(false)
const isNarrow = ref(false)

let lastX = 0
let lastY = 0
let activePointer = null
let narrowQuery = null

const desktopLabelOffsets = [
  { x: -70, y: -40 },
  { x: 48, y: -27 },
  { x: -72, y: 7 },
  { x: 51, y: 21 },
  { x: -10, y: 55 },
]

// 手机上地球占的屏幕比例更大，标签需要更大的外扩距离，避免都挤在中国附近。
const mobileLabelOffsets = [
  { x: -92, y: -57 },
  { x: 68, y: -42 },
  { x: -96, y: 10 },
  { x: 72, y: 31 },
  { x: -6, y: 76 },
]

const labelOffsets = computed(() =>
  isNarrow.value ? mobileLabelOffsets : desktopLabelOffsets,
)

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const cityDelay = (index) => `${index * (TIMING.starIntro.earthCityStep / 1000)}s`

const mapData = computed(() => {
  const projection = geoOrthographic()
    .rotate(rotation.value)
    .translate([CENTER, CENTER])
    .scale(BASE_RADIUS)
    .clipAngle(90)

  const path = geoPath(projection)
  const sphereCenter = [-rotation.value[0], -rotation.value[1]]
  const isVisible = (lon, lat) =>
    geoDistance([lon, lat], sphereCenter) < Math.PI / 2 - 0.015
  const project = (lon, lat) => {
    if (!isVisible(lon, lat)) return null
    const point = projection([lon, lat])
    return point ? { x: point[0], y: point[1] } : null
  }

  const cities = JOURNEY_CITIES.map((city, index) => {
    const point = project(city.lon, city.lat)
    const offset = labelOffsets.value[index] ?? { x: 0, y: 0 }
    return {
      ...city,
      index,
      visible: Boolean(point),
      x: point?.x ?? 0,
      y: point?.y ?? 0,
      labelX: (point?.x ?? 0) + offset.x,
      labelY: (point?.y ?? 0) + offset.y,
      lineEndX: (point?.x ?? 0) + offset.x * 0.56,
      lineEndY: (point?.y ?? 0) + offset.y * 0.56,
    }
  })

  const chinaPoint = project(104, 35)
  return {
    landPath: path(world) || '',
    chinaPath: path(china) || '',
    graticulePath: path(geoGraticule10()) || '',
    cities,
    china: chinaPoint
      ? { x: chinaPoint.x, y: chinaPoint.y - 11 }
      : null,
  }
})

function startDrag(event) {
  if (event.button !== undefined && event.button !== 0) return
  dragging.value = true
  hasDragged.value = true
  activePointer = event.pointerId
  lastX = event.clientX
  lastY = event.clientY
  globeEl.value?.setPointerCapture?.(event.pointerId)
  event.preventDefault()
}

function moveDrag(event) {
  if (!dragging.value || event.pointerId !== activePointer) return
  const dx = event.clientX - lastX
  const dy = event.clientY - lastY
  lastX = event.clientX
  lastY = event.clientY
  rotation.value = [
    rotation.value[0] + dx * 0.28,
    clamp(rotation.value[1] - dy * 0.25, MIN_PHI, MAX_PHI),
    0,
  ]
  event.preventDefault()
}

function endDrag(event) {
  if (event.pointerId !== activePointer) return
  dragging.value = false
  activePointer = null
  globeEl.value?.releasePointerCapture?.(event.pointerId)
}

function nudge(dx, dy) {
  hasDragged.value = true
  rotation.value = [
    rotation.value[0] + dx,
    clamp(rotation.value[1] - dy, MIN_PHI, MAX_PHI),
    0,
  ]
}

function handleKeydown(event) {
  const step = 10
  if (event.key === 'ArrowLeft') nudge(-step, 0)
  else if (event.key === 'ArrowRight') nudge(step, 0)
  else if (event.key === 'ArrowUp') nudge(0, step)
  else if (event.key === 'ArrowDown') nudge(0, -step)
  else return
  event.preventDefault()
}

onMounted(() => {
  narrowQuery = window.matchMedia('(max-width: 760px)')
  isNarrow.value = narrowQuery.matches
  narrowQuery.addEventListener?.('change', (event) => {
    isNarrow.value = event.matches
  })
})

onBeforeUnmount(() => {
  activePointer = null
})
</script>

<template>
  <div
    class="earth-journey"
    role="img"
    :aria-label="`${UI.earth.title}：${UI.earth.cityHint}`"
  >
    <div class="earth-stage">
      <div
        ref="globeEl"
        class="earth-globe"
        :class="{ 'is-dragging': dragging }"
        role="application"
        tabindex="0"
        :aria-label="UI.earth.dragHint"
        @pointerdown="startDrag"
        @pointermove="moveDrag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
        @keydown="handleKeydown"
      >
        <div class="earth-atmosphere" aria-hidden="true"></div>
        <span class="earth-orbit orbit-one" aria-hidden="true"></span>
        <span class="earth-orbit orbit-two" aria-hidden="true"></span>
        <span class="earth-orbit orbit-three" aria-hidden="true"></span>
        <span class="earth-orbit orbit-four" aria-hidden="true"></span>
        <span class="earth-aura" aria-hidden="true"></span>
        <span class="earth-sparkles" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i><i></i>
        </span>

        <svg
          class="earth-svg"
          :viewBox="`0 0 ${VIEW} ${VIEW}`"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="earthOcean" cx="35%" cy="28%" r="82%">
              <stop offset="0%" stop-color="#bfdbe8" />
              <stop offset="35%" stop-color="#83b0cd" />
              <stop offset="72%" stop-color="#567a9f" />
              <stop offset="100%" stop-color="#385574" />
            </radialGradient>
            <linearGradient id="earthLand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#f4e3c8" stop-opacity="0.96" />
              <stop offset="58%" stop-color="#b8cba2" stop-opacity="0.92" />
              <stop offset="100%" stop-color="#d9b7b2" stop-opacity="0.76" />
            </linearGradient>
            <radialGradient id="earthShade" cx="33%" cy="26%" r="80%">
              <stop offset="0%" stop-color="#fff9ec" stop-opacity="0.12" />
              <stop offset="48%" stop-color="#3c577b" stop-opacity="0" />
              <stop offset="80%" stop-color="#2a3a5b" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#17243b" stop-opacity="0.58" />
            </radialGradient>
            <radialGradient id="earthWarm" cx="28%" cy="22%" r="48%">
              <stop offset="0%" stop-color="#fff0d5" stop-opacity="0.32" />
              <stop offset="100%" stop-color="#ffd7c1" stop-opacity="0" />
            </radialGradient>
            <filter id="earthSoft">
              <feGaussianBlur stdDeviation="0.45" />
            </filter>
          </defs>

          <circle :cx="CENTER" :cy="CENTER" :r="BASE_RADIUS" fill="url(#earthOcean)" />
          <path class="earth-graticule" :d="mapData.graticulePath" />
          <g filter="url(#earthSoft)">
            <path class="earth-land" :d="mapData.landPath" />
            <path class="earth-china" :d="mapData.chinaPath" />
          </g>

          <circle
            :cx="CENTER"
            :cy="CENTER"
            :r="BASE_RADIUS"
            fill="url(#earthWarm)"
          />
          <circle
            :cx="CENTER"
            :cy="CENTER"
            :r="BASE_RADIUS"
            fill="url(#earthShade)"
          />
          <circle
            :cx="CENTER"
            :cy="CENTER"
            :r="BASE_RADIUS"
            class="earth-rim"
          />

          <g class="earth-cities">
            <g
              v-for="city in mapData.cities"
              v-show="city.visible"
              :key="city.name"
              class="city-mark"
              :style="{ '--city-delay': cityDelay(city.index) }"
            >
              <line
                :x1="city.x"
                :y1="city.y"
                :x2="city.lineEndX"
                :y2="city.lineEndY"
                class="city-leader"
              />
              <circle :cx="city.x" :cy="city.y" r="3.1" class="city-dot" />
              <text
                :x="city.labelX"
                :y="city.labelY"
                class="city-name"
                text-anchor="middle"
              >{{ city.name }}</text>
            </g>
          </g>

          <g v-if="mapData.china" class="china-mark">
            <text
              :x="mapData.china.x"
              :y="mapData.china.y"
              class="china-label"
              text-anchor="middle"
            >{{ UI.earth.chinaLabel }}</text>
          </g>
        </svg>
      </div>

      <p v-if="!hasDragged" class="earth-hint">{{ UI.earth.dragHint }}</p>
      <p v-else class="earth-hint is-dragged">{{ UI.earth.draggedHint }}</p>
    </div>
  </div>
</template>

<style scoped>
.earth-journey {
  position: absolute;
  inset: 0;
  z-index: 12;
  pointer-events: none;
  animation: earth-fade-in 1.8s ease both;
}

.earth-stage {
  position: absolute;
  left: 50%;
  top: 16%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transform: translateX(-50%);
}

.earth-globe {
  position: relative;
  width: clamp(360px, 48vmin, 470px);
  aspect-ratio: 1;
  border-radius: 50%;
  filter: drop-shadow(0 24px 48px rgba(67, 57, 91, 0.26));
  cursor: grab;
  pointer-events: auto;
  touch-action: none;
  outline: none;
  animation:
    earth-arrive 2.4s cubic-bezier(0.16, 0.76, 0.24, 1) both,
    earth-float 9s ease-in-out 2.4s infinite;
}

.earth-globe.is-dragging {
  cursor: grabbing;
  animation-play-state: paused;
}

.earth-globe:focus-visible {
  outline: 1px solid rgba(255, 236, 199, 0.56);
  outline-offset: 8px;
}

.earth-aura {
  position: absolute;
  inset: -19%;
  z-index: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 44%, rgba(255, 239, 208, 0.24), transparent 58%),
    radial-gradient(circle at 42% 58%, rgba(219, 188, 215, 0.15), transparent 64%);
  filter: blur(25px);
  pointer-events: none;
  animation: earth-aura-pulse 8s ease-in-out infinite alternate;
}

.earth-sparkles {
  position: absolute;
  inset: -8%;
  z-index: 3;
  pointer-events: none;
}

.earth-sparkles i {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 242, 206, 0.9);
  box-shadow:
    0 0 7px rgba(255, 238, 195, 0.8),
    0 0 16px rgba(238, 203, 219, 0.36);
  animation: earth-sparkle 4.8s ease-in-out infinite;
}

.earth-sparkles i:nth-child(1) {
  left: 6%;
  top: 28%;
  animation-delay: -0.4s;
}

.earth-sparkles i:nth-child(2) {
  left: 88%;
  top: 22%;
  animation-delay: -2.1s;
}

.earth-sparkles i:nth-child(3) {
  left: 15%;
  top: 76%;
  animation-delay: -3.2s;
}

.earth-sparkles i:nth-child(4) {
  left: 82%;
  top: 70%;
  animation-delay: -1.4s;
}

.earth-sparkles i:nth-child(5) {
  left: 48%;
  top: 2%;
  width: 3px;
  height: 3px;
  animation-delay: -2.7s;
}

.earth-sparkles i:nth-child(6) {
  left: 58%;
  top: 96%;
  width: 3px;
  height: 3px;
  animation-delay: -0.9s;
}

.earth-svg {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: visible;
  pointer-events: none;
}

.earth-atmosphere {
  position: absolute;
  inset: -11%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 26%, rgba(255, 247, 230, 0.55), transparent 34%),
    radial-gradient(circle, rgba(160, 199, 225, 0.3) 52%, transparent 73%);
  filter: blur(10px);
  animation: atmosphere-pulse 6s ease-in-out infinite;
}

.earth-orbit {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  border: 1px solid rgba(245, 230, 210, 0.17);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(var(--orbit-tilt, 0deg));
  animation: orbit-in 1.5s cubic-bezier(0.22, 0.61, 0.36, 1) var(--orbit-delay, 0s)
    forwards;
}

.earth-orbit::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -3px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 240, 202, 0.78);
  box-shadow:
    0 0 7px rgba(255, 236, 190, 0.65),
    0 0 16px rgba(221, 195, 230, 0.34);
}

.orbit-one {
  width: 118%;
  height: 36%;
  --orbit-tilt: -18deg;
  --orbit-delay: 0.28s;
  border-color: rgba(245, 230, 210, 0.22);
}

.orbit-two {
  width: 134%;
  height: 50%;
  --orbit-tilt: 24deg;
  --orbit-delay: 0.86s;
  border-color: rgba(206, 204, 233, 0.15);
}

.orbit-three {
  width: 108%;
  height: 76%;
  --orbit-tilt: 64deg;
  --orbit-delay: 1.46s;
  border-color: rgba(229, 200, 204, 0.13);
  border-style: dashed;
}

.orbit-four {
  width: 150%;
  height: 62%;
  --orbit-tilt: -42deg;
  --orbit-delay: 2.02s;
  border-color: rgba(216, 219, 239, 0.1);
}

.earth-orbit::after {
  animation: orbit-planet 5.4s ease-in-out infinite alternate;
}

.earth-graticule {
  fill: none;
  stroke: rgba(255, 249, 236, 0.17);
  stroke-width: 0.7;
}

.earth-land {
  fill: url(#earthLand);
  stroke: rgba(255, 244, 225, 0.28);
  stroke-width: 0.7;
}

.earth-china {
  fill: rgba(255, 207, 166, 0.44);
  stroke: rgba(255, 224, 174, 0.9);
  stroke-width: 1.45;
  filter: drop-shadow(0 0 5px rgba(255, 215, 161, 0.38));
}

.earth-rim {
  fill: none;
  stroke: rgba(255, 249, 238, 0.48);
  stroke-width: 1.1;
}

.earth-cities {
  pointer-events: none;
}

.city-mark {
  opacity: 0;
  animation: city-in 1.2s ease calc(0.8s + var(--city-delay)) forwards;
}

.city-leader {
  stroke: rgba(255, 235, 199, 0.58);
  stroke-width: 0.75;
}

.city-dot {
  fill: #fff2c9;
  stroke: rgba(255, 250, 237, 0.85);
  stroke-width: 0.8;
  filter: drop-shadow(0 0 5px rgba(255, 230, 175, 0.9));
  animation: city-pulse 3.2s ease-in-out calc(1.2s + var(--city-delay)) infinite;
}

.city-name {
  fill: rgba(255, 245, 225, 0.96);
  stroke: rgba(43, 53, 78, 0.74);
  stroke-width: 3.2px;
  paint-order: stroke;
  font-family: var(--font-body);
  font-size: 16px;
  letter-spacing: 0.05em;
}

.china-label {
  fill: rgba(255, 223, 174, 0.96);
  stroke: rgba(45, 53, 75, 0.78);
  stroke-width: 3.4px;
  paint-order: stroke;
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 0.12em;
  animation: china-label-in 2.2s ease 1.4s both;
}

.earth-hint {
  margin: 0;
  color: rgba(246, 232, 210, 0.48);
  font-size: 8px;
  letter-spacing: 0.1em;
  text-align: center;
  white-space: nowrap;
  animation: hint-in 1.4s ease 2s both;
}

.earth-hint.is-dragged {
  opacity: 0.62;
  color: rgba(255, 229, 187, 0.6);
}

@keyframes earth-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes earth-aura-pulse {
  from {
    opacity: 0.55;
    transform: scale(0.96);
  }
  to {
    opacity: 0.92;
    transform: scale(1.04);
  }
}

@keyframes earth-sparkle {
  0%,
  100% {
    opacity: 0.16;
    transform: scale(0.7);
  }
  50% {
    opacity: 0.92;
    transform: scale(1.3);
  }
}

@keyframes orbit-in {
  from {
    opacity: 0;
    scale: 0.84;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}

@keyframes orbit-planet {
  from {
    opacity: 0.42;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1.15);
  }
}

@keyframes earth-arrive {
  from {
    opacity: 0;
    transform: scale(0.66) translateY(18px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes earth-float {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -5px;
  }
}

@keyframes atmosphere-pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.95;
    transform: scale(1.04);
  }
}

@keyframes city-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes city-pulse {
  0%,
  100% {
    opacity: 0.58;
  }
  50% {
    opacity: 1;
  }
}

@keyframes china-label-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes hint-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 760px) {
  .earth-stage {
    top: 15%;
    gap: 6px;
  }

  .earth-globe {
    width: min(88vw, 370px);
  }

  .earth-hint {
    font-size: 7px;
    letter-spacing: 0.06em;
  }
}

@media (max-width: 380px) {
  .earth-globe {
    width: 310px;
  }

  .earth-stage {
    top: 14%;
  }
}
</style>
