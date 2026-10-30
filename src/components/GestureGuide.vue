<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { CAMERA_NOTES, COPY, GESTURES, UI } from '@/config/story'

const props = defineProps({
  status: { type: String, default: 'idle' },
  errorMessage: { type: String, default: '' },
  fallbackMode: { type: Boolean, default: false },
  gestureLabel: { type: String, default: UI.status.waiting },
})

const emit = defineEmits(['close', 'retry', 'skip'])

const closeButton = ref(null)
let previousFocus = null

const isBusy = computed(() => ['requesting', 'loading'].includes(props.status))
const isReady = computed(() => props.status === 'ready' && !props.fallbackMode)
const isManual = computed(
  () => props.fallbackMode || ['denied', 'no-camera', 'busy', 'unsupported', 'error'].includes(props.status),
)

const statusCopy = computed(() => {
  if (props.errorMessage) return props.errorMessage
  if (props.fallbackMode) return UI.guide.manualDescription
  return CAMERA_NOTES[props.status] || UI.guide.notConnected
})

function close() {
  emit('close')
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

onMounted(async () => {
  previousFocus = document.activeElement
  window.addEventListener('keydown', handleKeydown)
  await nextTick()
  closeButton.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (previousFocus instanceof HTMLElement) previousFocus.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="guide-overlay" @click.self="close">
      <div class="guide-card" role="dialog" aria-modal="true" aria-labelledby="guide-title">
        <div class="guide-glow glow-a" aria-hidden="true"></div>
        <div class="guide-glow glow-b" aria-hidden="true"></div>

        <header class="guide-header">
          <div>
            <p class="guide-kicker">{{ UI.guide.kicker }}</p>
            <h2 id="guide-title" class="guide-title">{{ UI.guide.title }}</h2>
          </div>
          <button
            ref="closeButton"
            type="button"
            class="guide-close"
            :aria-label="UI.guide.close"
            @click="close"
          >
            ×
          </button>
        </header>

        <div class="guide-status" :class="{ ready: isReady, manual: isManual }">
          <span class="guide-status-dot"></span>
          <div>
            <p class="guide-status-title">
              {{
                isReady
                  ? `${UI.guide.connected} · ${gestureLabel}`
                  : isManual
                    ? UI.guide.manual
                    : isBusy
                      ? UI.guide.connecting
                      : UI.guide.waiting
              }}
            </p>
            <p class="guide-status-copy">{{ statusCopy }}</p>
          </div>
        </div>

        <div class="gesture-list">
          <div v-for="gesture in GESTURES" :key="gesture.name" class="gesture-item">
            <span class="gesture-icon" aria-hidden="true">{{ gesture.icon }}</span>
            <div class="gesture-copy">
              <p class="gesture-name">{{ gesture.name }}</p>
              <p class="gesture-desc">{{ gesture.description }}</p>
            </div>
          </div>
        </div>

        <p class="privacy-note">{{ COPY.cameraPrivacy }} {{ UI.guide.privacySuffix }}</p>

        <div class="guide-actions">
          <button
            v-if="!isReady"
            type="button"
            class="guide-button primary"
            :disabled="isBusy"
            @click="emit('retry')"
          >
            {{ isBusy ? UI.guide.busy : COPY.cameraRetry }}
          </button>
          <button
            v-if="!fallbackMode"
            type="button"
            class="guide-button"
            @click="emit('skip')"
          >
            {{ COPY.cameraSkip }}
          </button>
          <span v-else class="guide-manual-hint">{{ UI.guide.manualOn }}</span>
          <button type="button" class="guide-button quiet" @click="close">
            {{ UI.guide.continue }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.guide-overlay {
  position: fixed;
  inset: 0;
  z-index: 260;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(33, 28, 34, 0.45);
  backdrop-filter: blur(12px);
  animation: guide-overlay-in 0.45s ease both;
}

.guide-card {
  position: relative;
  width: min(620px, 93vw);
  max-height: min(780px, 90vh);
  overflow: auto;
  padding: clamp(22px, 3.6vw, 38px);
  border: 1px solid rgba(255, 251, 242, 0.78);
  border-radius: 28px;
  background:
    radial-gradient(ellipse 65% 40% at 14% 0%, rgba(255, 255, 255, 0.8), transparent 72%),
    linear-gradient(145deg, #f7eee1, #eedecb);
  box-shadow:
    0 38px 100px rgba(29, 21, 26, 0.42),
    inset 0 0 50px rgba(255, 255, 255, 0.18);
  color: #5d4e51;
  animation: guide-card-in 0.7s cubic-bezier(0.2, 0.76, 0.25, 1) both;
  scrollbar-width: thin;
}

.guide-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(44px);
  pointer-events: none;
}

.glow-a {
  width: 200px;
  height: 180px;
  right: -50px;
  top: -40px;
  background: rgba(226, 189, 198, 0.33);
}

.glow-b {
  width: 240px;
  height: 180px;
  left: -60px;
  bottom: -65px;
  background: rgba(193, 203, 220, 0.24);
}

.guide-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.guide-kicker {
  margin: 0 0 4px;
  color: rgba(140, 115, 108, 0.5);
  font-family: 'Georgia', serif;
  font-size: 9px;
  letter-spacing: 0.22em;
}

.guide-title {
  margin: 0;
  color: #5f4c50;
  font-family: var(--font-display);
  font-size: clamp(21px, 3vw, 29px);
  font-weight: 400;
  letter-spacing: 0.12em;
}

.guide-close {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid rgba(126, 99, 94, 0.14);
  border-radius: 50%;
  color: rgba(106, 84, 82, 0.6);
  background: rgba(255, 250, 242, 0.4);
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

.guide-close:hover {
  color: #5f4b4c;
  background: rgba(255, 251, 244, 0.8);
}

.guide-status {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 22px;
  padding: 13px 16px;
  border: 1px solid rgba(137, 107, 100, 0.1);
  border-radius: 16px;
  background: rgba(255, 249, 239, 0.4);
}

.guide-status-dot {
  width: 6px;
  height: 6px;
  margin-top: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: rgba(156, 127, 118, 0.36);
}

.guide-status.ready .guide-status-dot {
  background: #9db9a0;
  box-shadow: 0 0 9px rgba(152, 187, 157, 0.55);
}

.guide-status.manual .guide-status-dot {
  background: #c3a884;
}

.guide-status-title {
  margin: 0;
  color: rgba(91, 72, 71, 0.86);
  font-size: 11px;
  letter-spacing: 0.05em;
}

.guide-status-copy {
  margin: 3px 0 0;
  color: rgba(106, 84, 82, 0.55);
  font-size: 10px;
  line-height: 1.7;
}

.gesture-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 16px;
}

.gesture-item {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 11px 8px;
  border-bottom: 1px solid rgba(137, 107, 100, 0.075);
}

.gesture-item:last-child {
  border-bottom: none;
}

.gesture-icon {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(139, 109, 102, 0.12);
  border-radius: 50%;
  background: rgba(255, 249, 239, 0.4);
  font-size: 16px;
}

.gesture-copy {
  min-width: 0;
}

.gesture-name {
  margin: 1px 0 2px;
  color: rgba(92, 73, 72, 0.9);
  font-size: 11px;
  letter-spacing: 0.07em;
}

.gesture-desc {
  margin: 0;
  color: rgba(105, 84, 81, 0.56);
  font-size: 10px;
  line-height: 1.75;
}

.privacy-note {
  position: relative;
  z-index: 1;
  margin: 12px 0 0;
  color: rgba(122, 98, 92, 0.46);
  font-size: 9px;
  letter-spacing: 0.04em;
  line-height: 1.7;
}

.guide-actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  margin-top: 22px;
}

.guide-button {
  padding: 9px 17px;
  border: 1px solid rgba(126, 99, 94, 0.15);
  border-radius: 999px;
  color: rgba(99, 78, 77, 0.72);
  background: rgba(255, 250, 243, 0.35);
  font-size: 10px;
  letter-spacing: 0.06em;
  transition:
    background 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.guide-button:hover {
  color: #5d494b;
  border-color: rgba(126, 99, 94, 0.25);
  background: rgba(255, 251, 245, 0.68);
}

.guide-button.primary {
  color: rgba(255, 249, 240, 0.88);
  border-color: rgba(173, 124, 133, 0.5);
  background: linear-gradient(145deg, #c99aa5, #b98290);
}

.guide-button.primary:hover {
  color: #fffaf4;
  background: linear-gradient(145deg, #cea3ad, #bd8996);
}

.guide-button.primary:disabled {
  opacity: 0.5;
  cursor: wait;
}

.guide-button.quiet {
  margin-left: auto;
  border-color: transparent;
  background: transparent;
}

.guide-manual-hint {
  color: rgba(137, 110, 101, 0.5);
  font-size: 9px;
  letter-spacing: 0.05em;
}

@keyframes guide-overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes guide-card-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 620px) {
  .guide-card {
    padding: 22px 18px;
    border-radius: 22px;
  }

  .gesture-item {
    padding: 9px 4px;
    gap: 10px;
  }

  .gesture-icon {
    width: 30px;
    height: 30px;
  }

  .guide-button.quiet {
    margin-left: 0;
  }
}
</style>
