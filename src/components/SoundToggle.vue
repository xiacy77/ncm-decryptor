<script setup>
import { computed } from 'vue'
import { UI } from '@/config/story'

const props = defineProps({
  enabled: { type: Boolean, default: true },
  started: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  playing: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle', 'retry'])

const label = computed(() => {
  if (props.blocked && props.enabled) return UI.sound.blocked
  if (!props.enabled) return UI.sound.enable
  if (!props.started) return UI.sound.pending
  if (!props.playing) return UI.sound.resume
  return UI.sound.mute
})

const isBlocked = computed(() => props.blocked && props.enabled)

function handleClick() {
  if (isBlocked.value) {
    emit('retry')
    return
  }
  emit('toggle')
}
</script>

<template>
  <button
    type="button"
    class="sound-toggle"
    :class="{ 'is-blocked': isBlocked, 'is-muted': !enabled }"
    :aria-label="label"
    :aria-pressed="enabled"
    :title="label"
    @click="handleClick"
  >
    <svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        v-if="!enabled"
        d="M4.5 9.4h3.1L12 5.7v12.6l-4.4-3.7H4.5V9.4Zm10.1 1.2 4.6 4.6m0-4.6-4.6 4.6"
      />
      <path
        v-else
        d="M4.5 9.4h3.1L12 5.7v12.6l-4.4-3.7H4.5V9.4Zm10.2-.2c1.4 1.4 1.4 4 0 5.5m2.5-8c2.6 2.6 2.6 7.4 0 10"
      />
    </svg>
    <span class="sound-label">{{ isBlocked ? UI.sound.shortcut : UI.sound.label }}</span>
    <span v-if="isBlocked" class="sound-alert" aria-hidden="true"></span>
    <span v-else-if="enabled && playing" class="sound-live" aria-hidden="true"></span>
  </button>
</template>

<style scoped>
.sound-toggle {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 13px 0 11px;
  border: 1px solid var(--ui-border, rgba(255, 250, 240, 0.14));
  border-radius: 999px;
  color: var(--ui-ink, rgba(247, 239, 230, 0.74));
  background: var(--ui-bg, rgba(247, 240, 228, 0.06));
  box-shadow: var(--ui-shadow, 0 10px 30px rgba(0, 0, 0, 0.12));
  backdrop-filter: blur(14px);
  transition:
    color 0.4s ease,
    background 0.4s ease,
    border-color 0.4s ease,
    transform 0.4s ease;
}

.sound-toggle:hover {
  color: var(--ui-ink-strong, rgba(255, 250, 242, 0.96));
  background: var(--ui-bg-hover, rgba(247, 240, 228, 0.1));
  transform: translateY(-1px);
}

.sound-icon {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.45;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sound-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

.sound-live {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.42;
  animation: sound-pulse 2.6s ease-in-out infinite;
}

.sound-alert {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--blush, #e7b6c6);
  box-shadow: 0 0 10px rgba(231, 182, 198, 0.8);
  animation: sound-pulse 1.8s ease-in-out infinite;
}

.sound-toggle.is-blocked {
  color: var(--ui-alert-ink, rgba(255, 248, 238, 0.92));
  border-color: var(--ui-alert-border, rgba(237, 202, 209, 0.34));
}

@keyframes sound-pulse {
  0%,
  100% {
    opacity: 0.22;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.88;
    transform: scale(1.15);
  }
}

@media (max-width: 620px) {
  .sound-toggle {
    width: 38px;
    padding: 0;
    justify-content: center;
  }

  .sound-label {
    display: none;
  }
}
</style>
