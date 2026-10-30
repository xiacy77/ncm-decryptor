<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { ALIEN_LINES, UI, assetUrl } from '@/config/story'

const rootEl = ref(null)
const bubble = ref(false)
const lineIndex = ref(Math.floor(Math.random() * ALIEN_LINES.length))
const dragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const petWebp = assetUrl('assets/pet/maid-idle.webp')
const petPng = assetUrl('assets/pet/maid-idle.png')

let hideTimer = null
let startPointer = null
let startOffset = null
let dragBounds = null
let suppressClickUntil = 0

const dragStyle = computed(() => ({
  transform: `translate3d(${dragOffset.value.x}px, ${dragOffset.value.y}px, 0)`,
}))

function poke() {
  if (performance.now() < suppressClickUntil) return
  if (bubble.value) {
    lineIndex.value = (lineIndex.value + 1) % ALIEN_LINES.length
  } else {
    bubble.value = true
  }
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    bubble.value = false
    hideTimer = null
  }, 5200)
}

function startDrag(event) {
  if (event.button !== undefined && event.button !== 0) return
  const element = rootEl.value
  if (!element) return
  const rect = element.getBoundingClientRect()
  startPointer = { x: event.clientX, y: event.clientY }
  startOffset = { ...dragOffset.value }
  dragBounds = {
    minX: 10 - rect.left + startOffset.x,
    maxX: window.innerWidth - 10 - rect.right + startOffset.x,
    minY: 10 - rect.top + startOffset.y,
    maxY: window.innerHeight - 10 - rect.bottom + startOffset.y,
  }
  dragging.value = true
  element.setPointerCapture?.(event.pointerId)
}

function moveDrag(event) {
  if (!dragging.value || !startPointer || !startOffset || !dragBounds) return
  const dx = event.clientX - startPointer.x
  const dy = event.clientY - startPointer.y
  if (Math.abs(dx) + Math.abs(dy) > 4) suppressClickUntil = performance.now() + 280
  dragOffset.value = {
    x: Math.min(dragBounds.maxX, Math.max(dragBounds.minX, startOffset.x + dx)),
    y: Math.min(dragBounds.maxY, Math.max(dragBounds.minY, startOffset.y + dy)),
  }
  event.preventDefault()
}

function endDrag(event) {
  if (!dragging.value) return
  dragging.value = false
  rootEl.value?.releasePointerCapture?.(event.pointerId)
  startPointer = null
  startOffset = null
  dragBounds = null
}

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <div
    ref="rootEl"
    class="cute-alien"
    :class="{ 'is-dragging': dragging }"
    :style="dragStyle"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @click.stop="poke"
  >
    <Transition name="alien-bubble">
      <div v-if="bubble" class="alien-speech" role="status">
        {{ ALIEN_LINES[lineIndex] }}
      </div>
    </Transition>

    <button
      type="button"
      class="alien-button"
      :aria-label="UI.alien.label"
      :title="UI.alien.label"
    >
      <span class="maid-glow" aria-hidden="true"></span>
      <span class="maid-float">
        <picture class="maid-picture">
          <source :srcset="petWebp" type="image/webp" />
          <img
            class="maid-image"
            :src="petPng"
            :alt="UI.alien.label"
            draggable="false"
          />
        </picture>
      </span>
    </button>
  </div>
</template>

<style scoped>
.cute-alien {
  position: relative;
  width: 140px;
  height: 164px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  animation: maid-drift 7.2s ease-in-out infinite;
  will-change: transform;
}

.cute-alien.is-dragging {
  cursor: grabbing;
  animation-play-state: paused;
}

.alien-button {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: inherit;
}

.maid-glow {
  position: absolute;
  left: 50%;
  top: 52%;
  width: 92%;
  height: 78%;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 244, 220, 0.32), transparent 62%),
    radial-gradient(circle at 62% 40%, rgba(208, 190, 235, 0.18), transparent 64%);
  filter: blur(16px);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.maid-float {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  animation: maid-float 5.8s ease-in-out infinite;
}

.maid-picture,
.maid-image {
  display: block;
  width: 100%;
  height: 100%;
}

.maid-image {
  object-fit: contain;
  object-position: 50% 100%;
  filter:
    saturate(0.88)
    brightness(1.035)
    drop-shadow(0 10px 16px rgba(62, 77, 113, 0.16));
  pointer-events: none;
}

.alien-speech {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 3px);
  z-index: 3;
  width: max-content;
  max-width: 220px;
  padding: 9px 13px;
  border: 1px solid rgba(255, 250, 242, 0.86);
  border-radius: 16px 16px 16px 4px;
  color: rgba(79, 63, 73, 0.84);
  background: rgba(255, 250, 243, 0.94);
  box-shadow: 0 10px 24px rgba(102, 77, 89, 0.13);
  font-size: 10px;
  letter-spacing: 0.035em;
  line-height: 1.7;
  transform: translateX(-28%);
  pointer-events: none;
  backdrop-filter: blur(8px);
}

.alien-speech::after {
  content: '';
  position: absolute;
  left: 22px;
  bottom: -5px;
  width: 9px;
  height: 9px;
  border-right: 1px solid rgba(255, 250, 242, 0.86);
  border-bottom: 1px solid rgba(255, 250, 242, 0.86);
  background: rgba(255, 250, 243, 0.94);
  transform: rotate(45deg);
}

@keyframes maid-drift {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -3px;
  }
}

@keyframes maid-float {
  0%,
  100% {
    transform: translateY(0) rotate(-0.7deg);
  }
  50% {
    transform: translateY(-5px) rotate(0.8deg);
  }
}

.alien-bubble-enter-active,
.alien-bubble-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.alien-bubble-enter-from,
.alien-bubble-leave-to {
  opacity: 0;
  transform: translate(-28%, 4px) scale(0.96);
}

@media (max-width: 700px) {
  .cute-alien {
    width: 108px;
    height: 126px;
  }

  .alien-speech {
    max-width: 166px;
    padding: 8px 11px;
    font-size: 9px;
    line-height: 1.65;
  }
}
</style>
