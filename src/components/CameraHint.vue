<script setup>
import { computed } from 'vue'
import { CAMERA_NOTES, COPY, UI } from '@/config/story'

const props = defineProps({
  status: { type: String, default: 'idle' },
  fallbackMode: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const emit = defineEmits(['skip', 'retry', 'open-guide', 'dismiss'])

const isBusy = computed(() => ['requesting', 'loading'].includes(props.status))

const message = computed(() => {
  if (props.fallbackMode) return UI.camera.fallback
  if (props.errorMessage) return props.errorMessage
  return CAMERA_NOTES[props.status] || UI.camera.preparing
})

const iconState = computed(() => {
  if (props.fallbackMode || ['denied', 'no-camera', 'busy', 'unsupported', 'error'].includes(props.status)) {
    return 'manual'
  }
  if (props.status === 'ready') return 'ready'
  return 'connecting'
})
</script>

<template>
  <aside class="camera-hint" :class="`is-${iconState}`">
    <div class="camera-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          d="M4.6 8.2h3l1.3-2h6.2l1.3 2h3v9.2H4.6V8.2Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linejoin="round"
        />
        <circle cx="12" cy="12.6" r="2.7" fill="none" stroke="currentColor" stroke-width="1.2" />
        <path d="m18.7 4.3.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5.5-1.4Z" fill="currentColor" opacity="0.7" />
      </svg>
      <span class="camera-pulse"></span>
    </div>

    <div class="camera-note">
      <p class="camera-message">{{ message }}</p>
      <p v-if="status === 'ready'" class="camera-sub">{{ COPY.cameraPrivacy }}</p>
      <div class="camera-actions">
        <button
          v-if="isBusy && !fallbackMode"
          type="button"
          class="camera-link strong"
          @click="emit('skip')"
        >
          {{ COPY.cameraSkip }}
        </button>
        <button
          v-if="!fallbackMode && !isBusy && status !== 'ready'"
          type="button"
          class="camera-link strong"
          @click="emit('retry')"
        >
          {{ COPY.cameraRetry }}
        </button>
        <button
          v-if="!isBusy && status !== 'ready'"
          type="button"
          class="camera-link"
          @click="emit('skip')"
        >
          {{ COPY.cameraManual }}
        </button>
        <button
          v-if="status === 'ready' && !fallbackMode"
          type="button"
          class="camera-link"
          @click="emit('skip')"
        >
          {{ UI.camera.switchToMouse }}
        </button>
        <button type="button" class="camera-link" @click="emit('open-guide')">
          {{ UI.camera.guideAction }}
        </button>
      </div>
    </div>

    <button
      type="button"
      class="camera-dismiss"
      :aria-label="UI.camera.dismiss"
      :title="UI.camera.dismiss"
      @click="emit('dismiss')"
    >
      ×
    </button>
  </aside>
</template>

<style scoped>
.camera-hint {
  position: fixed;
  left: max(16px, env(safe-area-inset-left));
  top: calc(16px + env(safe-area-inset-top));
  z-index: 80;
  display: flex;
  align-items: flex-start;
  gap: 11px;
  width: min(350px, calc(100vw - 132px));
  padding: 12px 30px 12px 12px;
  border: 1px solid var(--ui-border, rgba(255, 250, 240, 0.14));
  border-radius: 18px;
  color: var(--ui-ink, rgba(247, 239, 230, 0.7));
  background: var(--ui-bg, rgba(247, 240, 228, 0.06));
  box-shadow: var(--ui-shadow, 0 12px 30px rgba(0, 0, 0, 0.14));
  backdrop-filter: blur(14px);
  animation: camera-in 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

.camera-mark {
  position: relative;
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 1px solid var(--ui-border, rgba(255, 250, 240, 0.16));
  border-radius: 50%;
  color: var(--ui-ink, rgba(247, 239, 230, 0.7));
}

.camera-mark svg {
  width: 18px;
  height: 18px;
}

.camera-pulse {
  position: absolute;
  inset: -3px;
  border: 1px solid currentColor;
  border-radius: 50%;
  opacity: 0;
}

.is-connecting .camera-pulse {
  animation: camera-pulse 2.4s ease-out infinite;
}

.is-ready .camera-mark {
  color: var(--ui-ready, #b8ceb7);
}

.is-manual .camera-mark {
  opacity: 0.62;
}

.camera-note {
  min-width: 0;
}

.camera-message {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.035em;
  line-height: 1.7;
}

.camera-sub {
  margin: 2px 0 0;
  color: var(--ui-ink-faint, rgba(239, 232, 224, 0.38));
  font-size: 8px;
  letter-spacing: 0.04em;
}

.camera-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  margin-top: 6px;
}

.camera-link {
  padding: 0;
  border: none;
  color: var(--ui-ink-faint, rgba(239, 232, 224, 0.44));
  background: none;
  font-size: 9px;
  letter-spacing: 0.06em;
  text-align: left;
  transition: color 0.3s ease;
}

.camera-link.strong {
  color: var(--ui-ink-strong, rgba(255, 250, 242, 0.92));
}

.camera-link:hover {
  color: var(--ui-ink-strong, #fff8ef);
}

.camera-dismiss {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border: none;
  color: var(--ui-ink-faint, rgba(239, 232, 224, 0.34));
  background: transparent;
  font-size: 16px;
  font-weight: 300;
  line-height: 1;
}

.camera-dismiss:hover {
  color: var(--ui-ink-strong, #fff8ef);
}

@keyframes camera-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes camera-pulse {
  0% {
    opacity: 0.4;
    transform: scale(0.9);
  }
  80%,
  100% {
    opacity: 0;
    transform: scale(1.45);
  }
}

@media (max-width: 620px) {
  .camera-hint {
    width: calc(100vw - 118px);
    max-width: 300px;
    padding: 10px 26px 10px 10px;
    border-radius: 15px;
  }

  .camera-message {
    font-size: 9px;
  }
}
</style>
