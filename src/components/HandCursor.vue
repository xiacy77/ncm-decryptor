<script setup>
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { UI } from '@/config/story'
import { GESTURE_KEY } from '@/keys'

defineProps({
  mode: { type: String, default: 'star' },
})

const gestureApi = inject(GESTURE_KEY, null)
const cursorEl = ref(null)
const labelEl = ref(null)
const visible = ref(false)
const currentGesture = ref('none')

let rafHandle = 0
let lastLabel = ''
let hideTimer = null

function updateCursor() {
  if (!gestureApi) {
    rafHandle = requestAnimationFrame(updateCursor)
    return
  }

  const palm = gestureApi.live.palm
  const ready = gestureApi.status.value === 'ready'
  const shouldShow = ready && palm.present
  const element = cursorEl.value

  if (element && shouldShow) {
    const x = palm.x * window.innerWidth
    const y = palm.y * window.innerHeight
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  if (shouldShow) {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    if (!visible.value) visible.value = true

    const stableName = gestureApi.gesture.value || 'none'
    if (stableName !== lastLabel && labelEl.value) {
      lastLabel = stableName
      const name = gestureApi.gestureLabel.value
      labelEl.value.textContent = name === UI.status.waiting ? UI.status.recognized : name
    }
  } else if (!hideTimer) {
    hideTimer = setTimeout(() => {
      visible.value = false
      hideTimer = null
    }, 220)
  }

  rafHandle = requestAnimationFrame(updateCursor)
}

watch(
  () => gestureApi?.gesture.value,
  (value) => {
    currentGesture.value = value || 'none'
  },
  { immediate: true },
)

onMounted(() => {
  rafHandle = requestAnimationFrame(updateCursor)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafHandle)
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <div
    ref="cursorEl"
    class="hand-cursor"
    :class="[
      `gesture-${currentGesture}`,
      `mode-${mode}`,
      { 'is-visible': visible },
    ]"
    aria-hidden="true"
  >
    <span class="cursor-halo"></span>
    <span class="cursor-ring ring-outer"></span>
    <span class="cursor-ring ring-inner"></span>
    <span class="cursor-star">✦</span>
    <span class="cursor-orbit orbit-a"></span>
    <span class="cursor-orbit orbit-b"></span>
    <span ref="labelEl" class="cursor-label">{{ UI.status.recognized }}</span>
  </div>
</template>

<style scoped>
.hand-cursor {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 88;
  width: 1px;
  height: 1px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
  will-change: transform;
}

.hand-cursor.is-visible {
  opacity: 1;
}

.cursor-halo,
.cursor-ring,
.cursor-star,
.cursor-orbit,
.cursor-label {
  position: absolute;
  left: 50%;
  top: 50%;
}

.cursor-halo {
  width: 86px;
  height: 86px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 248, 233, 0.42) 0%,
    rgba(226, 210, 239, 0.18) 42%,
    transparent 70%
  );
  filter: blur(4px);
  animation: hand-halo 3.4s ease-in-out infinite alternate;
}

.cursor-ring {
  border: 1px solid rgba(247, 231, 207, 0.7);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.ring-outer {
  width: 52px;
  height: 52px;
  opacity: 0.55;
  box-shadow: 0 0 20px rgba(242, 222, 195, 0.22);
}

.ring-inner {
  width: 28px;
  height: 28px;
  border-color: rgba(255, 249, 237, 0.86);
  border-style: dashed;
  opacity: 0.52;
  animation: hand-spin 14s linear infinite;
}

.cursor-star {
  transform: translate(-50%, -50%);
  color: #fff6e6;
  font-size: 19px;
  line-height: 1;
  text-shadow:
    0 0 10px rgba(255, 245, 224, 0.95),
    0 0 26px rgba(227, 202, 233, 0.75);
  animation: hand-star 2.6s ease-in-out infinite alternate;
}

.cursor-orbit {
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  border-radius: 50%;
  background: rgba(255, 247, 229, 0.9);
  box-shadow: 0 0 9px rgba(255, 243, 218, 0.9);
}

.orbit-a {
  animation: hand-orbit 4.8s linear infinite;
}

.orbit-b {
  width: 2.5px;
  height: 2.5px;
  animation: hand-orbit 6.4s linear infinite reverse;
  animation-delay: -2s;
  opacity: 0.6;
}

.cursor-label {
  top: calc(50% + 44px);
  transform: translate(-50%, 0);
  padding: 4px 9px;
  border: 1px solid rgba(255, 248, 236, 0.2);
  border-radius: 999px;
  color: rgba(255, 248, 238, 0.86);
  background: rgba(17, 19, 31, 0.36);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.12);
  font-size: 9px;
  letter-spacing: 0.07em;
  line-height: 1.3;
  white-space: nowrap;
  backdrop-filter: blur(8px);
}

.gesture-openPalm .ring-outer {
  width: 76px;
  height: 76px;
  border-style: dashed;
  border-color: rgba(255, 243, 219, 0.58);
  animation: hand-spin 22s linear infinite reverse;
}

.gesture-openPalm .cursor-halo {
  width: 118px;
  height: 118px;
  opacity: 0.9;
}

.gesture-fist .cursor-halo {
  width: 66px;
  height: 66px;
  background: radial-gradient(
    circle,
    rgba(255, 249, 235, 0.86),
    rgba(232, 210, 230, 0.25) 42%,
    transparent 70%
  );
}

.gesture-fist .cursor-star {
  font-size: 25px;
}

.gesture-loveYou .cursor-halo,
.gesture-ok .cursor-halo,
.gesture-thumbsUp .cursor-halo {
  background: radial-gradient(
    circle,
    rgba(255, 239, 220, 0.58),
    rgba(238, 184, 199, 0.25) 46%,
    transparent 72%
  );
}

.mode-bloom .cursor-label {
  color: rgba(92, 74, 77, 0.82);
  background: rgba(255, 250, 243, 0.68);
  border-color: rgba(255, 252, 246, 0.7);
}

.mode-bloom .cursor-ring {
  border-color: rgba(177, 137, 143, 0.48);
}

.mode-bloom .ring-outer {
  width: 94px;
  height: 94px;
  border-style: dashed;
  opacity: 0.44;
}

.mode-bloom .cursor-halo {
  width: 122px;
  height: 122px;
}

.mode-bloom .cursor-star {
  color: #fffaf0;
  text-shadow:
    0 0 10px rgba(255, 249, 235, 0.95),
    0 0 24px rgba(225, 169, 184, 0.55);
}

.mode-bloom .cursor-halo {
  background: radial-gradient(
    circle,
    rgba(255, 248, 235, 0.52),
    rgba(241, 199, 207, 0.2) 44%,
    transparent 72%
  );
}

@keyframes hand-spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes hand-halo {
  from {
    opacity: 0.55;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 0.92;
    transform: translate(-50%, -50%) scale(1.08);
  }
}

@keyframes hand-star {
  from {
    opacity: 0.72;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.12);
  }
}

@keyframes hand-orbit {
  from {
    transform: rotate(0deg) translateX(37px) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(37px) rotate(-360deg);
  }
}

@media (max-width: 620px) {
  .cursor-label {
    top: calc(50% + 38px);
    font-size: 8px;
  }

  .gesture-openPalm .ring-outer {
    width: 64px;
    height: 64px;
  }
}
</style>
