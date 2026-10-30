<!-- <script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { MEMORY_NODES, TIMING, UI } from '@/config/story'

const props = defineProps({
  dimmed: { type: Boolean, default: false },
})

const emit = defineEmits(['complete'])

const stageEl = ref(null)
const isMobile = ref(false)
const revealedCount = ref(0)
const focusedIndex = ref(-1)
const panorama = ref(false)
const sequenceDone = ref(false)
const finale = ref(false)
const finaleReady = ref(false)

const camera = ref({
  scale: 1,
  x: 0,
  y: 0,
  duration: TIMING.starIntro.memoryFocusTransition,
})

const entryVectors = [
  { x: -36, y: -12 },
  { x: 34, y: -14 },
  { x: -32, y: 14 },
  { x: 38, y: 10 },
  { x: -35, y: -16 },
  { x: 32, y: 14 },
  { x: -33, y: 10 },
  { x: 36, y: -12 },
  { x: -30, y: 16 },
]

const farStars = Array.from({ length: 58 }, (_, index) => ({
  id: index,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 0.8 + Math.random() * 1.6,
  opacity: 0.08 + Math.random() * 0.28,
  delay: -Math.random() * 10,
  duration: 4 + Math.random() * 8,
}))

const nearDust = Array.from({ length: 10 }, (_, index) => ({
  id: index,
  left: 4 + Math.random() * 92,
  top: 18 + Math.random() * 72,
  size: 16 + Math.random() * 44,
  opacity: 0.04 + Math.random() * 0.11,
  blur: 3 + Math.random() * 7,
}))

const desktopPositions = [
  { x: 12, y: 61 },
  { x: 22, y: 46 },
  { x: 32, y: 57 },
  { x: 41, y: 38 },
  { x: 50, y: 51 },
  { x: 60, y: 34 },
  { x: 70, y: 46 },
  { x: 80, y: 35 },
  { x: 90, y: 57 },
]

const mobilePositions = [
  { x: 38, y: 29 },
  { x: 62, y: 29 },
  { x: 86, y: 29 },
  { x: 86, y: 45 },
  { x: 62, y: 45 },
  { x: 38, y: 45 },
  { x: 38, y: 61 },
  { x: 62, y: 61 },
  { x: 86, y: 61 },
]

let mediaQuery = null
let cancelled = false
let runId = 0
let resizeHandler = null

const positions = computed(() => (isMobile.value ? mobilePositions : desktopPositions))

const routePoints = computed(() =>
  positions.value.map((point) => `${point.x},${point.y}`).join(' '),
)

const routeProgress = computed(() => {
  if (revealedCount.value <= 1) return 0
  return (revealedCount.value - 1) / (MEMORY_NODES.length - 1)
})

const cameraStyle = computed(() => ({
  transform: `translate3d(${camera.value.x}px, ${camera.value.y}px, 0) scale(${camera.value.scale})`,
  transitionDuration: `${camera.value.duration}ms`,
}))

const farStyle = computed(() => ({
  transform: `translate3d(${camera.value.x * 0.24}px, ${camera.value.y * 0.24}px, 0) scale(${
    1 + (camera.value.scale - 1) * 0.24
  })`,
  transitionDuration: `${camera.value.duration}ms`,
}))

const nearStyle = computed(() => ({
  transform: `translate3d(${camera.value.x * 1.08}px, ${camera.value.y * 1.08}px, 0) scale(${
    1 + (camera.value.scale - 1) * 0.88
  })`,
  transitionDuration: `${camera.value.duration}ms`,
}))

function entryStyle(index) {
  const vector = entryVectors[index % entryVectors.length]
  const angle = (Math.atan2(vector.y, vector.x) * 180) / Math.PI
  return {
    '--meteor-x': `${vector.x}vw`,
    '--meteor-y': `${vector.y}vh`,
    '--trail-angle': `${angle}deg`,
  }
}

const rootClass = computed(() => ({
  'is-mobile': isMobile.value,
  'is-dimmed': props.dimmed,
  'is-panorama': panorama.value,
  'is-finale': finale.value,
  'is-finale-ready': finaleReady.value,
  'is-done': sequenceDone.value,
  'is-focusing': focusedIndex.value >= 0 && !panorama.value,
}))

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function applyFocus(index, animate = true) {
  const element = stageEl.value
  if (!element) return
  const rect = element.getBoundingClientRect()
  const point = positions.value[index]
  if (!point) return
  const scale = isMobile.value ? 1.5 : 1.58
  const x = -(point.x / 100 - 0.5) * rect.width * scale
  const y = -(point.y / 100 - 0.5) * rect.height * scale
  camera.value = {
    scale,
    x,
    y,
    duration: animate ? TIMING.starIntro.memoryFocusTransition : 0,
  }
}

function resetCamera(duration = TIMING.starIntro.memoryPanoramaTransition) {
  camera.value = { scale: 1, x: 0, y: 0, duration }
}

function syncMedia(event) {
  isMobile.value = event.matches
  if (!panorama.value && focusedIndex.value >= 0) {
    applyFocus(focusedIndex.value, false)
  }
}

async function runSequence() {
  const token = ++runId
  const timings = TIMING.starIntro
  await wait(timings.memoryStartDelay)
  if (cancelled || token !== runId) return

  for (let index = 0; index < MEMORY_NODES.length; index += 1) {
    if (cancelled || token !== runId) return
    focusedIndex.value = index
    applyFocus(index)
    revealedCount.value = index + 1
    await wait(timings.memoryFocusStep)
  }

  if (cancelled || token !== runId) return
  await wait(timings.memoryPanoramaHold)
  if (cancelled || token !== runId) return

  panorama.value = true
  focusedIndex.value = -1
  resetCamera()
  await wait(timings.memoryPanoramaTransition + 250)
  if (cancelled || token !== runId) return
  sequenceDone.value = true
  emit('complete')
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 760px)')
  isMobile.value = mediaQuery.matches
  mediaQuery.addEventListener?.('change', syncMedia)
  resizeHandler = () => {
    if (!panorama.value && focusedIndex.value >= 0) {
      applyFocus(focusedIndex.value, false)
    }
  }
  window.addEventListener('resize', resizeHandler, { passive: true })
  runSequence()
})

onBeforeUnmount(() => {
  cancelled = true
  runId += 1
  mediaQuery?.removeEventListener?.('change', syncMedia)
  window.removeEventListener('resize', resizeHandler)
})
</script> -->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { MEMORY_NODES, TIMING, UI } from '@/config/story'

const props = defineProps({
  dimmed: { type: Boolean, default: false },
})

const emit = defineEmits(['complete'])

const stageEl = ref(null)
const isMobile = ref(false)
const revealedCount = ref(0)
const focusedIndex = ref(-1)
const panorama = ref(false)
const sequenceDone = ref(false)
const finale = ref(false)
const finaleReady = ref(false)

const camera = ref({
  scale: 1,
  x: 0,
  y: 0,
  duration: TIMING.starIntro.memoryFocusTransition,
})

const entryVectors = [
  { x: -36, y: -12 },
  { x: 34, y: -14 },
  { x: -32, y: 14 },
  { x: 38, y: 10 },
  { x: -35, y: -16 },
  { x: 32, y: 14 },
  { x: -33, y: 10 },
  { x: 36, y: -12 },
  { x: -30, y: 16 },
]

const farStars = Array.from({ length: 58 }, (_, index) => ({
  id: index,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 0.8 + Math.random() * 1.6,
  opacity: 0.08 + Math.random() * 0.28,
  delay: -Math.random() * 10,
  duration: 4 + Math.random() * 8,
}))

const nearDust = Array.from({ length: 10 }, (_, index) => ({
  id: index,
  left: 4 + Math.random() * 92,
  top: 18 + Math.random() * 72,
  size: 16 + Math.random() * 44,
  opacity: 0.04 + Math.random() * 0.11,
  blur: 3 + Math.random() * 7,
}))

const desktopPositions = [
  { x: 12, y: 61 },
  { x: 22, y: 46 },
  { x: 32, y: 57 },
  { x: 41, y: 38 },
  { x: 50, y: 51 },
  { x: 60, y: 34 },
  { x: 70, y: 46 },
  { x: 80, y: 35 },
  { x: 90, y: 57 },
]

const mobilePositions = [
  { x: 38, y: 29 },
  { x: 62, y: 29 },
  { x: 86, y: 29 },
  { x: 86, y: 45 },
  { x: 62, y: 45 },
  { x: 38, y: 45 },
  { x: 38, y: 61 },
  { x: 62, y: 61 },
  { x: 86, y: 61 },
]

let mediaQuery = null
let resizeHandler = null
let dragStartX = 0
let isDragging = false
let pointerId = null
let autoTimer = null
let autoStartTimer = null
let finaleTimer = null
let autoPausedUntil = 0
const totalNodes = MEMORY_NODES.length
const stepThreshold = 60

const positions = computed(() => (isMobile.value ? mobilePositions : desktopPositions))

const routePoints = computed(() =>
  positions.value.map((point) => `${point.x},${point.y}`).join(' '),
)

const routeProgress = computed(() => {
  if (revealedCount.value <= 1) return 0
  return (revealedCount.value - 1) / (MEMORY_NODES.length - 1)
})

const cameraStyle = computed(() => ({
  transform: `translate3d(${camera.value.x}px, ${camera.value.y}px, 0) scale(${camera.value.scale})`,
  transitionDuration: `${camera.value.duration}ms`,
}))

const farStyle = computed(() => ({
  transform: `translate3d(${camera.value.x * 0.24}px, ${camera.value.y * 0.24}px, 0) scale(${
    1 + (camera.value.scale - 1) * 0.24
  })`,
  transitionDuration: `${camera.value.duration}ms`,
}))

const nearStyle = computed(() => ({
  transform: `translate3d(${camera.value.x * 1.08}px, ${camera.value.y * 1.08}px, 0) scale(${
    1 + (camera.value.scale - 1) * 0.88
  })`,
  transitionDuration: `${camera.value.duration}ms`,
}))

function entryStyle(index) {
  const vector = entryVectors[index % entryVectors.length]
  const angle = (Math.atan2(vector.y, vector.x) * 180) / Math.PI
  return {
    '--meteor-x': `${vector.x}vw`,
    '--meteor-y': `${vector.y}vh`,
    '--trail-angle': `${angle}deg`,
  }
}

const rootClass = computed(() => ({
  'is-mobile': isMobile.value,
  'is-dimmed': props.dimmed,
  'is-panorama': panorama.value,
  'is-finale': finale.value,
  'is-finale-ready': finaleReady.value,
  'is-done': sequenceDone.value,
  'is-focusing': focusedIndex.value >= 0 && !panorama.value,
}))

function applyFocus(index, animate = true) {
  const element = stageEl.value
  if (!element) return
  const rect = element.getBoundingClientRect()
  const point = positions.value[index]
  if (!point) return
  const scale = isMobile.value ? 1.5 : 1.58
  const x = -(point.x / 100 - 0.5) * rect.width * scale
  const y = -(point.y / 100 - 0.5) * rect.height * scale
  camera.value = {
    scale,
    x,
    y,
    duration: animate ? TIMING.starIntro.memoryFocusTransition : 0,
  }
}

function resetCamera(duration = TIMING.starIntro.memoryPanoramaTransition) {
  camera.value = { scale: 1, x: 0, y: 0, duration }
}

function syncMedia(event) {
  isMobile.value = event.matches
  if (!panorama.value && focusedIndex.value >= 0) {
    applyFocus(focusedIndex.value, false)
  }
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
}

function startAuto() {
  if (autoTimer || panorama.value || finale.value || finaleReady.value) return
  autoTimer = setInterval(() => {
    if (panorama.value || finale.value || finaleReady.value) return
    if (revealedCount.value >= totalNodes) return
    if (performance.now() < autoPausedUntil) return
    goStep(1)
  }, TIMING.starIntro.memoryAutoStep ?? 2500)
}

function triggerFinale() {
  stopAuto()
  autoPausedUntil = Number.POSITIVE_INFINITY
  setTimeout(() => {
    if (revealedCount.value < totalNodes || finale.value) return
    panorama.value = true
    focusedIndex.value = -1
    resetCamera()
    // 等镜头拉回、九颗星全部定格后再闪烁，最后停在画面上等待继续。
    finaleTimer = setTimeout(() => {
      finale.value = true
      finaleTimer = setTimeout(() => {
        finaleReady.value = true
        finaleTimer = null
      }, TIMING.starIntro.memoryFinaleFlash ?? 1900)
    }, TIMING.starIntro.memoryPanoramaTransition + 250)
  }, TIMING.starIntro.memoryPanoramaHold ?? 900)
}

function goStep(delta, { manual = false } = {}) {
  if (panorama.value || finale.value) return
  const next = revealedCount.value + delta
  if (next < 0 || next > totalNodes) return

  if (manual) {
    // 手动回看 / 前进后先暂停自动播放一会儿，避免立刻被抢走。
    autoPausedUntil = performance.now() + 6000
    if (!autoTimer) startAuto()
  }

  revealedCount.value = next

  if (next > 0 && next <= totalNodes) {
    focusedIndex.value = next - 1
    applyFocus(focusedIndex.value)
  }

  if (next === totalNodes) triggerFinale()
}

function manualStep(delta) {
  goStep(delta, { manual: true })
}

function finishSequence() {
  if (!finaleReady.value || sequenceDone.value) return
  sequenceDone.value = true
  finale.value = false
  emit('complete')
}

// 滚轮
function onWheel(e) {
  e.preventDefault()
  e.stopPropagation()
  if (panorama.value) return
  if (e.deltaY > 20) {
    goStep(1, { manual: true })
  } else if (e.deltaY < -20) {
    goStep(-1, { manual: true })
  }
}

// 拖拽
function onPointerDown(e) {
  if (panorama.value) return
  isDragging = true
  dragStartX = e.clientX
  pointerId = e.pointerId
  stageEl.value.setPointerCapture(pointerId)
}

function onPointerMove(e) {
  if (!isDragging || panorama.value || e.pointerId !== pointerId) return
  const dx = dragStartX - e.clientX
  // 向右滑 dx>0 → 下一个；向左滑 dx<0 → 上一个
  if (Math.abs(dx) >= stepThreshold) {
    if (dx > 0) goStep(1, { manual: true })
    else goStep(-1, { manual: true })
    dragStartX = e.clientX
  }
}

function onPointerUp(e) {
  if (e.pointerId === pointerId) {
    isDragging = false
    stageEl.value.releasePointerCapture(pointerId)
    pointerId = null
  }
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 760px)')
  isMobile.value = mediaQuery.matches
  mediaQuery.addEventListener?.('change', syncMedia)
  resizeHandler = () => {
    if (!panorama.value && focusedIndex.value >= 0) {
      applyFocus(focusedIndex.value, false)
    }
  }
  window.addEventListener('resize', resizeHandler, { passive: true })

  stageEl.value.addEventListener('wheel', onWheel, { passive: false })
  stageEl.value.addEventListener('pointerdown', onPointerDown)
  stageEl.value.addEventListener('pointermove', onPointerMove)
  stageEl.value.addEventListener('pointerup', onPointerUp)
  stageEl.value.addEventListener('pointercancel', onPointerUp)
  autoStartTimer = setTimeout(startAuto, TIMING.starIntro.memoryAutoStartDelay ?? 900)
})

onBeforeUnmount(() => {
  stopAuto()
  if (autoStartTimer) clearTimeout(autoStartTimer)
  if (finaleTimer) clearTimeout(finaleTimer)
  mediaQuery?.removeEventListener?.('change', syncMedia)
  window.removeEventListener('resize', resizeHandler)
  stageEl.value?.removeEventListener('wheel', onWheel)
  stageEl.value?.removeEventListener('pointerdown', onPointerDown)
  stageEl.value?.removeEventListener('pointermove', onPointerMove)
  stageEl.value?.removeEventListener('pointerup', onPointerUp)
  stageEl.value?.removeEventListener('pointercancel', onPointerUp)
})
</script>



<template>
  <div
    ref="stageEl"
    class="memory-timeline"
    :class="rootClass"
    role="list"
    :aria-label="UI.star.timelineTitle"
  >
    <span class="memory-aura" aria-hidden="true"></span>
    <span class="memory-orbit memory-orbit-a" aria-hidden="true"></span>
    <span class="memory-orbit memory-orbit-b" aria-hidden="true"></span>

    <div class="depth-layer depth-far" :style="farStyle" aria-hidden="true">
      <span
        v-for="star in farStars"
        :key="`far-${star.id}`"
        class="far-star"
        :style="{
          left: `${star.left}%`,
          top: `${star.top}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.opacity,
          '--far-delay': `${star.delay}s`,
          '--far-duration': `${star.duration}s`,
        }"
      ></span>
    </div>

    <div class="memory-world" :style="cameraStyle">
      <svg
        class="route-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          class="route-halo"
          :points="routePoints"
          pathLength="1"
          :style="{ strokeDashoffset: 1 - routeProgress }"
        />
        <polyline
          class="route-line"
          :points="routePoints"
          pathLength="1"
          :style="{ strokeDashoffset: 1 - routeProgress }"
        />
      </svg>

      <div
        v-for="(node, index) in MEMORY_NODES"
        :key="node.id"
        class="memory-node"
        :class="[
          `label-${isMobile ? 'below' : index % 2 === 0 ? 'below' : 'above'}`,
          {
            'is-current': node.current,
            'is-revealed': index < revealedCount,
            'is-focused': index === focusedIndex,
          },
        ]"
        :style="{
          left: `${positions[index].x}%`,
          top: `${positions[index].y}%`,
          '--node-duration': `${TIMING.starIntro.memoryNodeDuration}ms`,
          ...entryStyle(index),
        }"
        role="listitem"
      >
        <span class="node-flight">
          <span class="node-trail" aria-hidden="true"></span>
          <span class="node-burst" aria-hidden="true"></span>
          <span class="node-halo" aria-hidden="true"></span>
          <span class="node-orbit" aria-hidden="true"></span>
          <span class="node-focus-ring" aria-hidden="true"></span>
          <span class="node-flicker" aria-hidden="true"></span>
          <span class="node-core" aria-hidden="true">✦</span>

          <span class="node-copy">
            <span class="node-event">{{ node.event }}</span>
            <span class="node-date">{{ node.date }}</span>
          </span>
        </span>
      </div>
    </div>

    <div class="depth-layer depth-near" :style="nearStyle" aria-hidden="true">
      <span
        v-for="dust in nearDust"
        :key="`near-${dust.id}`"
        class="near-dust"
        :style="{
          left: `${dust.left}%`,
          top: `${dust.top}%`,
          width: `${dust.size}px`,
          height: `${dust.size}px`,
          opacity: dust.opacity,
          filter: `blur(${dust.blur}px)`,
        }"
      ></span>
    </div>

    <div
      v-if="!panorama && revealedCount > 0"
      class="timeline-progress"
      aria-hidden="true"
    >
      <span
        v-for="(node, index) in MEMORY_NODES"
        :key="`progress-${node.id}`"
        class="progress-star"
        :class="{
          'is-lit': index < revealedCount,
          'is-current': index === focusedIndex,
        }"
      ></span>
    </div>

    <div v-if="!panorama && !finale" class="timeline-tools">
      <button
        type="button"
        class="timeline-back"
        :disabled="revealedCount === 0"
        @click.stop="manualStep(-1)"
      >
        <span aria-hidden="true">←</span>
        {{ UI.star.timelineBack }}
      </button>
      <p class="timeline-hint">{{ UI.star.timelineHint }}</p>
    </div>

    <Transition name="timeline-continue">
      <div v-if="finaleReady && !sequenceDone" class="timeline-continue">
        <button type="button" class="timeline-continue-button" @click.stop="finishSequence">
          {{ UI.star.timelineContinue }}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* .memory-timeline {
  position: absolute;
  inset: 0;
  z-index: 11;
  overflow: hidden;
  pointer-events: none;
  transition:
    opacity 2.4s ease,
    filter 2.4s ease;
} */
 .memory-timeline {
  position: absolute;
  inset: 0;
  z-index: 11;
  overflow: hidden;
  pointer-events: auto; /* 这里从 none 改成 auto！！这是最核心的坑！ */
  touch-action: none;
  transition:
    opacity 2.4s ease,
    filter 2.4s ease;
}


.memory-timeline.is-dimmed {
  opacity: 0;
  filter: blur(2.6px) saturate(0.75);
  transition:
    opacity 0.8s ease,
    filter 0.8s ease;
}

.depth-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  transform-origin: 50% 50%;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.2, 0.72, 0.25, 1);
  will-change: transform;
}

.depth-far {
  z-index: 0;
}

.depth-near {
  z-index: 2;
}

.far-star {
  position: absolute;
  border-radius: 50%;
  background: rgba(250, 243, 230, 0.9);
  box-shadow: 0 0 6px rgba(227, 226, 247, 0.36);
  animation: far-twinkle var(--far-duration) ease-in-out var(--far-delay) infinite alternate;
}

.near-dust {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 245, 226, 0.8) 0%,
    rgba(226, 208, 241, 0.35) 36%,
    transparent 74%
  );
  mix-blend-mode: screen;
}

.memory-world {
  position: absolute;
  inset: 0;
  z-index: 1;
  transform-origin: 50% 50%;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.2, 0.72, 0.25, 1);
  will-change: transform;
}

.route-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.route-halo,
.route-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  transition: stroke-dashoffset 0.9s ease;
}

.route-halo {
  stroke: rgba(187, 198, 236, 0.15);
  stroke-width: 4;
}

.route-line {
  stroke: rgba(238, 226, 211, 0.38);
  stroke-width: 1;
  filter: drop-shadow(0 0 5px rgba(214, 219, 245, 0.25));
}

.memory-node {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  transform: scale(0.36);
  filter: blur(7px);
  transition:
    opacity 0.7s ease,
    transform var(--node-duration, 820ms) cubic-bezier(0.18, 0.72, 0.26, 1),
    filter 0.8s ease;
}

.memory-node.is-revealed {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

.node-flight {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.memory-node.is-revealed .node-flight {
  animation: meteor-arrive var(--node-duration, 950ms) cubic-bezier(0.16, 0.74, 0.26, 1)
    both;
}

.node-trail {
  position: absolute;
  left: 0;
  top: 0;
  width: clamp(90px, 13vw, 180px);
  height: 2px;
  transform-origin: 0 50%;
  transform: translate3d(0, -50%, 0) rotate(var(--trail-angle)) scaleX(0.55);
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(255, 245, 224, 0.82),
    rgba(223, 205, 239, 0.3) 58%,
    transparent
  );
  filter: blur(0.4px);
  opacity: 0;
} 

.memory-node.is-revealed .node-trail {
  animation: meteor-trail var(--node-duration, 950ms) ease-out both;
}

.node-halo,
.node-burst,
.node-core,
.node-orbit,
.node-focus-ring {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
}

.node-halo {
  width: 54px;
  height: 54px;
  background: radial-gradient(
    circle,
    rgba(255, 248, 235, 0.5) 0%,
    rgba(231, 213, 239, 0.18) 40%,
    transparent 72%
  );
  filter: blur(2px);
  opacity: 0;
}

.memory-node.is-revealed .node-halo {
  opacity: 1;
  animation: node-breathe 3.8s ease-in-out 0.4s infinite alternate;
}

.memory-node.is-focused .node-halo {
  width: 82px;
  height: 82px;
  background: radial-gradient(
    circle,
    rgba(255, 249, 236, 0.68) 0%,
    rgba(239, 201, 219, 0.3) 39%,
    transparent 73%
  );
}

.node-core {
  display: grid;
  place-items: center;
  width: 13px;
  height: 13px;
  color: rgba(255, 248, 237, 0.96);
  background: radial-gradient(circle, #fff9ec 0 30%, #ead7b4 58%, transparent 72%);
  box-shadow:
    0 0 12px rgba(255, 246, 227, 0.9),
    0 0 28px rgba(216, 207, 239, 0.45);
  font-size: 9px;
  line-height: 1;
}

.memory-node.is-focused .node-core {
  box-shadow:
    0 0 18px rgba(255, 247, 229, 1),
    0 0 40px rgba(231, 189, 208, 0.55);
}

.node-orbit {
  width: 26px;
  height: 26px;
  border: 1px solid rgba(226, 216, 242, 0.3);
  transform: translate(-50%, -50%) scale(0.6);
  opacity: 0;
}

.memory-node.is-revealed .node-orbit {
  animation: node-orbit 4.8s ease-out 0.3s infinite;
}

.node-focus-ring {
  width: 68px;
  height: 68px;
  border: 1px dashed rgba(255, 242, 222, 0.3);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.76);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.memory-node.is-focused .node-focus-ring {
  opacity: 0.7;
  transform: translate(-50%, -50%) scale(1);
  animation: focus-spin 12s linear infinite;
}

.node-burst {
  width: 8px;
  height: 8px;
  box-shadow:
    0 0 0 1px rgba(255, 248, 237, 0.35),
    0 0 20px rgba(255, 248, 237, 0.75);
  opacity: 0;
}

.memory-node.is-revealed .node-burst {
  animation: node-burst 4.6s ease-out 0.1s 1;
}

.node-copy {
  position: absolute;
  left: 0;
  top: 19px;
  width: 142px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
  white-space: nowrap;
  transition: opacity 0.45s ease;
}

.memory-timeline.is-focusing .memory-node:not(.is-focused) {
  opacity: 0.4;
}

.memory-timeline.is-focusing .memory-node:not(.is-focused) .node-copy {
  opacity: 0;
}

.memory-timeline.is-focusing .memory-node:not(.is-focused) .node-halo {
  animation: none;
  opacity: 0.22;
}

.label-above .node-copy {
  top: auto;
  bottom: 19px;
}

.node-event {
  padding: 2px 8px;
  border: 1px solid rgba(243, 232, 218, 0.12);
  border-radius: 999px;
  color: rgba(250, 242, 232, 0.82);
  background: rgba(12, 15, 28, 0.3);
  font-size: 10px;
  letter-spacing: 0.09em;
  line-height: 1.55;
  backdrop-filter: blur(5px);
}

.node-date {
  color: rgba(220, 217, 231, 0.56);
  font-size: 9px;
  letter-spacing: 0.04em;
  line-height: 1.5;
  text-shadow: 0 0 12px rgba(9, 10, 20, 0.8);
}

.is-current .node-halo {
  background: radial-gradient(
    circle,
    rgba(255, 240, 220, 0.62) 0%,
    rgba(238, 184, 199, 0.24) 42%,
    transparent 72%
  );
}

.is-current .node-core {
  color: #fffaf0;
  background: radial-gradient(circle, #fff9ee 0 28%, #e8c7ca 60%, transparent 74%);
  box-shadow:
    0 0 15px rgba(255, 243, 226, 1),
    0 0 34px rgba(225, 167, 183, 0.58);
}

.is-current .node-event {
  color: rgba(255, 233, 226, 0.9);
  border-color: rgba(232, 186, 196, 0.25);
}

.is-current .node-date {
  color: rgba(239, 205, 212, 0.68);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 9px;
  letter-spacing: 0.1em;
}

.memory-timeline.is-dimmed .memory-aura,
.memory-timeline.is-dimmed .memory-orbit {
  opacity: 0;
  transition: opacity 1.4s ease;
}

.memory-aura {
  position: absolute;
  left: 50%;
  top: 48%;
  z-index: 0;
  width: min(86vw, 1050px);
  height: min(62vh, 620px);
  border-radius: 50%;
  background:
    radial-gradient(ellipse 50% 44% at 50% 45%, rgba(255, 243, 216, 0.1), transparent 70%),
    radial-gradient(ellipse 64% 54% at 42% 53%, rgba(204, 185, 224, 0.06), transparent 74%),
    radial-gradient(ellipse 44% 38% at 66% 38%, rgba(238, 194, 203, 0.05), transparent 72%);
  filter: blur(10px);
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: memory-aura-breathe 12s ease-in-out infinite alternate;
}

.memory-orbit {
  position: absolute;
  left: 50%;
  top: 49%;
  z-index: 0;
  border: 1px solid rgba(236, 219, 191, 0.1);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(-13deg);
}

.memory-orbit-a {
  width: min(82vw, 960px);
  height: min(38vh, 360px);
}

.memory-orbit-b {
  width: min(58vw, 680px);
  height: min(56vh, 500px);
  border-color: rgba(199, 194, 230, 0.08);
  transform: translate(-50%, -50%) rotate(24deg);
}

.timeline-progress {
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 19%;
  display: flex;
  align-items: center;
  gap: 12px;
  transform: translateX(-50%);
  animation: progress-in 0.7s ease both;
}

.progress-star {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(218, 219, 234, 0.12);
  transition:
    background 0.5s ease,
    transform 0.5s ease,
    box-shadow 0.5s ease;
}

.progress-star.is-lit {
  background: rgba(249, 237, 217, 0.82);
  box-shadow: 0 0 9px rgba(245, 228, 201, 0.5);
}

.progress-star.is-current {
  transform: scale(1.45);
  background: #fff8e9;
  box-shadow:
    0 0 10px rgba(255, 246, 229, 0.9),
    0 0 22px rgba(231, 183, 199, 0.48);
}

.node-flicker {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 250, 231, 0.72),
    rgba(236, 192, 205, 0.24) 32%,
    transparent 70%
  );
  filter: blur(3px);
  opacity: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.is-finale .memory-node.is-revealed .node-flicker {
  animation: node-finale-flicker 0.62s ease-in-out 3;
}

.timeline-tools {
  position: absolute;
  left: 50%;
  bottom: 8.8%;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  transform: translateX(-50%);
  pointer-events: none;
  animation: tools-in 0.8s ease 1.1s both;
}

.timeline-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  border: 1px solid rgba(238, 226, 213, 0.18);
  border-radius: 999px;
  color: rgba(241, 232, 223, 0.58);
  background: rgba(248, 240, 230, 0.04);
  font-size: 9px;
  letter-spacing: 0.06em;
  pointer-events: auto;
  transition:
    color 0.3s ease,
    border-color 0.3s ease,
    background 0.3s ease;
}

.timeline-back:hover:not(:disabled) {
  color: rgba(255, 248, 235, 0.9);
  border-color: rgba(238, 226, 213, 0.34);
  background: rgba(248, 240, 230, 0.09);
}

.timeline-back:disabled {
  opacity: 0.28;
  cursor: default;
}

.timeline-hint {
  margin: 0;
  color: rgba(220, 217, 231, 0.34);
  font-size: 8px;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.timeline-continue {
  position: absolute;
  left: 50%;
  bottom: 9%;
  z-index: 8;
  transform: translateX(-50%);
}

.timeline-continue-button {
  padding: 11px 26px;
  border: 1px solid rgba(255, 238, 213, 0.46);
  border-radius: 999px;
  color: rgba(255, 249, 238, 0.92);
  background: rgba(248, 239, 228, 0.1);
  box-shadow:
    0 0 22px rgba(238, 213, 170, 0.16),
    inset 0 0 20px rgba(255, 246, 231, 0.08);
  font-size: 12px;
  letter-spacing: 0.16em;
  animation: continue-glow 2.8s ease-in-out infinite;
  backdrop-filter: blur(8px);
}

.timeline-continue-button span {
  margin-left: 7px;
  font-size: 13px;
}

.timeline-continue-enter-active {
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.timeline-continue-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.timeline-continue-enter-from,
.timeline-continue-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

@keyframes memory-aura-breathe {
  from {
    opacity: 0.55;
    transform: translate(-50%, -50%) scale(0.96);
  }
  to {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1.03);
  }
}

@keyframes node-finale-flicker {
  0%,
  100% {
    opacity: 0;
  }
  32% {
    opacity: 0.96;
    filter: brightness(1.8) blur(2px);
  }
  62% {
    opacity: 0.18;
  }
}

@keyframes tools-in {
  from {
    opacity: 0;
    transform: translate(-50%, 5px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes continue-glow {
  0%,
  100% {
    box-shadow:
      0 0 18px rgba(238, 213, 170, 0.12),
      inset 0 0 20px rgba(255, 246, 231, 0.06);
  }
  50% {
    box-shadow:
      0 0 34px rgba(238, 213, 170, 0.3),
      inset 0 0 24px rgba(255, 246, 231, 0.12);
  }
}

@keyframes far-twinkle {
  from {
    opacity: 0.16;
    transform: scale(0.8);
  }
  to {
    opacity: 0.62;
    transform: scale(1.12);
  }
}

@keyframes meteor-arrive {
  0% {
    opacity: 0;
    transform: translate3d(var(--meteor-x), var(--meteor-y), 0) scale(0.24);
    filter: blur(9px);
  }
  14% {
    opacity: 1;
  }
  68% {
    transform: translate3d(0, 0, 0) scale(1.08);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }
}

@keyframes meteor-trail {
  0% {
    opacity: 0;
    transform: translate3d(0, -50%, 0) rotate(var(--trail-angle)) scaleX(0.35);
  }
  18% {
    opacity: 0.9;
  }
  58% {
    opacity: 0.48;
  }
  100% {
    opacity: 0;
    transform: translate3d(0, -50%, 0) rotate(var(--trail-angle)) scaleX(1.2);
  }
}

@keyframes node-breathe {
  from {
    opacity: 0.55;
    transform: translate(-50%, -50%) scale(0.86);
  }
  to {
    opacity: 0.95;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes node-orbit {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.35);
  }
  22% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2.6);
  }
}

@keyframes node-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  12% {
    opacity: 0.9;
  }
  45%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(3.2);
  }
}

@keyframes focus-spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg) scale(1);
  }
}

@keyframes progress-in {
  from {
    opacity: 0;
    transform: translate(-50%, 5px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@media (max-width: 760px) {
  .node-copy {
    top: 17px;
    width: 112px;
  }

  .label-above .node-copy {
    top: 17px;
    bottom: auto;
  }

  .node-event {
    padding: 2px 6px;
    font-size: 9px;
    letter-spacing: 0.04em;
  }

  .node-date {
    font-size: 8px;
    letter-spacing: 0.01em;
  }

  .node-halo {
    width: 42px;
    height: 42px;
  }

  .node-focus-ring {
    width: 58px;
    height: 58px;
  }

  .timeline-progress {
    bottom: 24%;
    gap: 10px;
  }
}

@media (max-width: 380px) {
  .node-copy {
    width: 102px;
  }

  .node-event {
    padding: 1px 4px;
    font-size: 8px;
  }

  .node-date {
    font-size: 7px;
  }
}
</style>
