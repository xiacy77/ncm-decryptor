<script setup>
import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { UI, WHISPERS } from '@/config/story'
import { GESTURE_KEY } from '@/keys'

const props = defineProps({
  active: { type: Boolean, default: false },
})

const gestureApi = inject(GESTURE_KEY, null)
const activeWhisper = ref(null)
const touchedId = ref(null)
const touching = new Set()

const positions = [
  { x: 12, y: 12 },
  { x: 32, y: 10 },
  { x: 52, y: 8 },
  { x: 72, y: 10 },
  { x: 88, y: 13 },
  { x: 5, y: 30 },
  { x: 95, y: 31 },
  { x: 5, y: 48 },
  { x: 95, y: 49 },
  { x: 10, y: 66 },
  { x: 26, y: 77 },
  { x: 10, y: 86 },
  { x: 90, y: 86 },
  { x: 74, y: 77 },
  { x: 90, y: 66 },
]

const motes = WHISPERS.map((whisper, index) => {
  const position = positions[index % positions.length]
  return {
    ...whisper,
    id: `whisper-${index}`,
    x: position.x,
    y: position.y,
    delay: `${-((index * 1.7) % 12).toFixed(2)}s`,
    duration: `${(8 + (index % 5) * 1.4).toFixed(2)}s`,
    drift: `${(index % 2 ? 1 : -1) * (8 + (index % 4) * 5)}px`,
    enterDelay: `${(0.15 + index * 0.18).toFixed(2)}s`,
    below: position.y < 55,
  }
})

let rafHandle = 0
let hideTimer = null
const lastTriggered = new Map()

function triggerWhisper(mote) {
  if (!props.active) return
  const now = performance.now()
  const previous = lastTriggered.get(mote.id) || 0
  if (now - previous < 2200) return
  lastTriggered.set(mote.id, now)
  touchedId.value = mote.id
  activeWhisper.value = mote
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    activeWhisper.value = null
    hideTimer = null
  }, 3200)
  setTimeout(() => {
    if (touchedId.value === mote.id) touchedId.value = null
  }, 1300)
}

function handlePointerEnter(mote) {
  triggerWhisper(mote)
}

function handleClick(mote) {
  triggerWhisper(mote)
}

function updateHandTouch() {
  if (!props.active || !gestureApi) {
    rafHandle = requestAnimationFrame(updateHandTouch)
    return
  }
  const palm = gestureApi.live.palm
  if (palm.present) {
    const width = window.innerWidth
    const height = window.innerHeight
    const x = palm.x * width
    const y = palm.y * height
    for (const mote of motes) {
      const moteX = (mote.x / 100) * width
      const moteY = (mote.y / 100) * height
      const isTouching = Math.hypot(moteX - x, moteY - y) < 56
      if (isTouching && !touching.has(mote.id)) {
        touching.add(mote.id)
        triggerWhisper(mote)
      } else if (!isTouching) {
        touching.delete(mote.id)
      }
    }
  }
  rafHandle = requestAnimationFrame(updateHandTouch)
}

onMounted(() => {
  rafHandle = requestAnimationFrame(updateHandTouch)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafHandle)
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <div
    class="star-whispers"
    :class="{ 'is-active': active }"
  >
    <button
      v-for="mote in motes"
      :key="mote.id"
      type="button"
      class="whisper-mote"
      :class="{ 'is-touched': touchedId === mote.id }"
      :style="{
        left: `${mote.x}%`,
        top: `${mote.y}%`,
        '--mote-delay': mote.delay,
        '--mote-duration': mote.duration,
        '--mote-drift': mote.drift,
        '--mote-enter-delay': mote.enterDelay,
      }"
      :aria-label="`${UI.star.whisperLabel}：${mote.text}`"
      @pointerenter="handlePointerEnter(mote)"
      @click.stop="handleClick(mote)"
    >
      <span class="mote-glow" aria-hidden="true"></span>
      <span class="mote-glyph" aria-hidden="true">{{ mote.icon }}</span>
      <span class="mote-dot" aria-hidden="true"></span>
    </button>

    <Transition name="whisper">
      <div
        v-if="activeWhisper"
        class="whisper-bubble"
        :class="{ 'is-below': activeWhisper.below }"
        :style="{
          '--bubble-left': `${activeWhisper.x}%`,
          top: `${activeWhisper.y}%`,
        }"
        role="status"
        aria-live="polite"
      >
        <span class="whisper-mark" aria-hidden="true">✦</span>
        <span>{{ activeWhisper.text }}</span>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.star-whispers {
  position: absolute;
  inset: 0;
  z-index: 14;
  pointer-events: none;
  opacity: 0;
  transition: opacity 2s ease;
}

.star-whispers.is-active {
  opacity: 1;
}

.star-whispers:not(.is-active) .whisper-mote {
  pointer-events: none;
}

.whisper-mote {
  position: absolute;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  color: rgba(249, 232, 209, 0.82);
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation:
    whisper-pop 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) var(--mote-enter-delay) both,
    whisper-float var(--mote-duration) ease-in-out var(--mote-delay) infinite alternate;
  transition:
    transform 0.45s ease,
    color 0.45s ease;
  will-change: transform;
}

.whisper-mote:hover,
.whisper-mote.is-touched {
  color: #fffaf0;
  transform: translate(-50%, -50%) scale(1.24);
}

.mote-glow {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 245, 224, 0.2),
    rgba(228, 202, 232, 0.08) 52%,
    transparent 72%
  );
  filter: blur(2px);
}

.mote-glyph {
  position: relative;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(16px, 1.55vw, 22px);
  line-height: 1;
  text-shadow:
    0 0 10px rgba(255, 243, 222, 0.55),
    0 0 20px rgba(210, 205, 241, 0.32);
}

.whisper-mote[aria-label$='想你'] .mote-glyph,
.whisper-mote[aria-label$='爱你'] .mote-glyph,
.whisper-mote[aria-label$='你好可爱'] .mote-glyph,
.whisper-mote[aria-label$='火鸡面大王'] .mote-glyph {
  color: rgba(244, 201, 210, 0.9);
}

.mote-dot {
  position: absolute;
  right: 8px;
  top: 10px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 250, 239, 0.9);
  box-shadow: 0 0 7px rgba(255, 247, 231, 0.8);
}

.whisper-bubble {
  position: absolute;
  left: clamp(130px, var(--bubble-left, 50%), calc(100% - 130px));
  z-index: 20;
  max-width: 250px;
  margin-top: 27px;
  padding: 9px 14px;
  transform: translateX(-50%);
  border: 1px solid rgba(255, 250, 242, 0.55);
  border-radius: 16px 16px 16px 5px;
  color: rgba(91, 73, 76, 0.88);
  background: linear-gradient(135deg, rgba(255, 249, 240, 0.92), rgba(243, 226, 225, 0.85));
  box-shadow:
    0 12px 26px rgba(0, 0, 0, 0.16),
    inset 0 0 20px rgba(255, 255, 255, 0.24);
  font-size: 11px;
  letter-spacing: 0.06em;
  line-height: 1.7;
  pointer-events: none;
  backdrop-filter: blur(10px);
}

.whisper-bubble.is-below {
  margin-top: 0;
  margin-bottom: 27px;
  transform: translate(-50%, -100%);
  border-radius: 16px 16px 5px 16px;
}

.whisper-mark {
  margin-right: 5px;
  color: #bf9d79;
  font-size: 10px;
}

.whisper-enter-active {
  transition:
    opacity 0.55s ease,
    transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.whisper-leave-active {
  transition:
    opacity 1.1s ease,
    transform 1.1s ease;
}

.whisper-enter-from,
.whisper-leave-to {
  opacity: 0;
}

@keyframes whisper-pop {
  from {
    opacity: 0;
    filter: blur(7px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes whisper-float {
  from {
    transform: translate(-50%, -50%) translate3d(0, 4px, 0);
  }
  to {
    transform: translate(-50%, -50%) translate3d(var(--mote-drift), -10px, 0);
  }
}

@media (max-width: 760px) {
  .whisper-mote {
    width: 38px;
    height: 38px;
  }

  .mote-glyph {
    font-size: 17px;
  }

  .whisper-bubble {
    left: clamp(136px, var(--bubble-left, 50%), calc(100% - 136px));
    max-width: min(250px, 70vw);
    font-size: 10px;
    padding: 8px 11px;
  }
}
</style>
