<script setup>
import { computed } from 'vue'
import { UI } from '@/config/story'

const props = defineProps({
  status: { type: String, default: 'idle' },
  fallbackMode: { type: Boolean, default: false },
  gestureLabel: { type: String, default: UI.status.waiting },
})

const emit = defineEmits(['open'])

const state = computed(() => {
  if (props.fallbackMode || ['denied', 'no-camera', 'unsupported', 'busy', 'error'].includes(props.status)) {
    return { key: 'manual', label: UI.status.manual, hint: UI.status.manualHint }
  }
  if (props.status === 'requesting') {
    return { key: 'loading', label: UI.status.connecting, hint: UI.status.requestingHint }
  }
  if (props.status === 'loading') {
    return { key: 'loading', label: UI.status.loading, hint: UI.status.loadingHint }
  }
  if (props.status === 'ready') {
    const current = props.gestureLabel && props.gestureLabel !== UI.status.waiting
      ? ` · ${props.gestureLabel}`
      : ''
    return { key: 'ready', label: `${UI.status.readyPrefix}${current}`, hint: UI.status.readyHint }
  }
  return { key: 'idle', label: UI.status.idle, hint: UI.status.readyHint }
})
</script>

<template>
  <button
    type="button"
    class="gesture-status"
    :class="`status-${state.key}`"
    :aria-label="state.hint"
    :title="state.hint"
    @click="emit('open')"
  >
    <svg class="status-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8.4 11.2V7a1.1 1.1 0 0 1 2.2 0v3.6M10.6 10.6V5.3a1.1 1.1 0 0 1 2.2 0v5.3M12.8 10.6V6.1a1.1 1.1 0 0 1 2.2 0v5.2M15 11.3V8.2a1.1 1.1 0 0 1 2.2 0v6.2c0 3.1-2.2 5.4-5.6 5.4-2.2 0-3.6-1-4.7-2.8l-2-3.2a1.25 1.25 0 0 1 2.1-1.3l1.4 2"
      />
    </svg>
    <span class="status-dot" aria-hidden="true"></span>
    <span class="status-label">{{ state.label }}</span>
    <svg class="status-chevron" viewBox="0 0 16 16" aria-hidden="true">
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </svg>
  </button>
</template>

<style scoped>
.gesture-status {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--ui-border, rgba(255, 250, 240, 0.14));
  border-radius: 999px;
  color: var(--ui-ink, rgba(247, 239, 230, 0.7));
  background: var(--ui-bg, rgba(247, 240, 228, 0.06));
  box-shadow: var(--ui-shadow, 0 10px 30px rgba(0, 0, 0, 0.12));
  backdrop-filter: blur(14px);
  transition:
    color 0.4s ease,
    background 0.4s ease,
    border-color 0.4s ease,
    transform 0.4s ease;
}

.gesture-status:hover {
  color: var(--ui-ink-strong, rgba(255, 250, 242, 0.96));
  background: var(--ui-bg-hover, rgba(247, 240, 228, 0.1));
  transform: translateY(-1px);
}

.status-icon {
  display: none;
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.35;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.78;
}

.status-dot {
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.48;
}

.status-ready .status-dot {
  background: #b7d0ba;
  opacity: 0.9;
  box-shadow: 0 0 10px rgba(167, 202, 172, 0.55);
}

.status-loading .status-dot {
  animation: status-blink 1.4s ease-in-out infinite;
}

.status-label {
  max-width: 180px;
  overflow: hidden;
  font-size: 10px;
  letter-spacing: 0.07em;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.status-chevron {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.45;
}

@keyframes status-blink {
  0%,
  100% {
    opacity: 0.22;
  }
  50% {
    opacity: 0.9;
  }
}

@media (max-width: 620px) {
  .gesture-status {
    width: 38px;
    padding: 0;
    justify-content: center;
  }

  .status-icon {
    display: block;
  }

  .status-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 4px;
    height: 4px;
  }

  .status-label,
  .status-chevron {
    display: none;
  }
}
</style>
