<script setup>
import { ref } from 'vue'
import { MENU_ITEMS, UI } from '@/config/story'

const emit = defineEmits(['select'])
const open = ref(true)

function choose(id) {
  emit('select', id)
}
</script>

<template>
  <Transition name="menu-fade">
    <div
      v-if="open"
      class="memory-menu"
      role="navigation"
      :aria-label="UI.menu.title"
      :title="UI.menu.hint"
    >
      <div class="menu-topline">
        <span class="menu-kicker">{{ UI.menu.kicker }}</span>
        <span class="menu-title">
          <span class="menu-title-spark" aria-hidden="true">✦</span>
          {{ UI.menu.title }}
        </span>
        <button
          type="button"
          class="menu-collapse"
          :aria-label="UI.menu.toggleClose"
          :title="UI.menu.toggleClose"
          @click="open = false"
        >
          <span aria-hidden="true">⌄</span>
        </button>
      </div>

      <div class="menu-items">
        <button
          v-for="(item, index) in MENU_ITEMS"
          :key="item.id"
          type="button"
          class="menu-item"
          :class="`menu-item-${item.id}`"
          :style="{ '--item-index': index }"
          :aria-label="`${item.label} · ${item.en}`"
          @click="choose(item.id)"
        >
          <span class="menu-icon" aria-hidden="true">
            <svg v-if="item.id === 'album'" viewBox="0 0 32 32">
              <path
                d="M5 8.7c3.9-1.4 7.7-.9 10.3 1.1 2.6-2 6.4-2.5 10.3-1.1v15.8c-3.8-1.2-7.6-.7-10.3 1.3-2.7-2-6.5-2.5-10.3-1.3V8.7Z"
              />
              <path d="M15.3 10.2v15m-6-12.1c1.5-.4 3-.3 4.2.2m-4.2 3c1.5-.4 3-.3 4.2.2m5.3-3.4c1.2-.5 2.7-.6 4.2-.2m-4.2 3c1.2-.5 2.7-.6 4.2-.2" />
            </svg>
            <svg v-else-if="item.id === 'anniversary'" viewBox="0 0 32 32">
              <path
                d="M16 27.2S5.2 21 5.2 13.2c0-4 2.8-6.4 6-6.4 2.2 0 3.8 1.2 4.8 2.6 1-1.4 2.6-2.6 4.8-2.6 3.2 0 6 2.4 6 6.4C26.8 21 16 27.2 16 27.2Z"
              />
              <text x="16" y="17.8" text-anchor="middle">1</text>
            </svg>
            <svg v-else-if="item.id === 'diary'" viewBox="0 0 32 32">
              <path d="M8 5.8h14.5a2 2 0 0 1 2 2v18.4H10a2 2 0 0 1-2-2V5.8Z" />
              <path d="M8 8.2H5.8v18.4h2.4M12 11h8m-8 4h8m-8 4h5" />
              <path d="M23.6 9.2l-5.2 8-3.4 1 1-3.4 5.2-8 2.4 2.4Z" class="icon-accent" />
            </svg>
            <svg v-else-if="item.id === 'play'" viewBox="0 0 32 32">
              <path d="M16 4.5c1.5 5.4 5.1 9 10.5 10.5-5.4 1.5-9 5.1-10.5 10.5C14.5 20.1 10.9 16.5 5.5 15 10.9 13.5 14.5 9.9 16 4.5Z" />
              <path d="M24.6 20.8c.5 2.2 2 3.7 4.2 4.2-2.2.5-3.7 2-4.2 4.2-.5-2.2-2-3.7-4.2-4.2 2.2-.5 3.7-2 4.2-4.2Z" class="icon-accent" />
            </svg>
            <svg v-else viewBox="0 0 32 32">
              <path d="M4.2 9.6h23.6v15.2H4.2V9.6Z" />
              <path d="m5 10.4 11 8.7 11-8.7M12.6 18.8l-3 4.4m9.8-4.4 3 4.4" />
            </svg>
          </span>
          <span class="menu-label">{{ item.label }}</span>
          <span class="menu-en">{{ item.en }}</span>
        </button>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="menu-reopen"
      :aria-label="UI.menu.toggleOpen"
      :title="UI.menu.toggleOpen"
      @click="open = true"
    >
      <span class="reopen-spark" aria-hidden="true">✦</span>
      <span>{{ UI.menu.title }}</span>
    </button>
  </Transition>
</template>

<style scoped>
.memory-menu {
  position: absolute;
  left: 50%;
  bottom: calc(22px + env(safe-area-inset-bottom));
  z-index: 20;
  width: min(760px, calc(100vw - 26px));
  padding: 12px 18px 16px;
  border: 1px solid rgba(171, 132, 128, 0.3);
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255, 250, 242, 0.94), rgba(239, 223, 214, 0.9)),
    radial-gradient(circle at 12% 8%, rgba(255, 255, 255, 0.5), transparent 36%);
  box-shadow:
    0 20px 52px rgba(88, 63, 69, 0.22),
    inset 0 0 30px rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(17px);
  transform: translateX(-50%);
  pointer-events: auto;
  animation: menu-rise 1.25s cubic-bezier(0.18, 0.66, 0.28, 1) both;
}

.memory-menu::before {
  content: '✿  ·  ✦  ·  ✿';
  position: absolute;
  left: 50%;
  top: -15px;
  color: rgba(196, 148, 146, 0.5);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 9px;
  letter-spacing: 0.32em;
  pointer-events: none;
  transform: translateX(-50%);
  white-space: nowrap;
}

.memory-menu::after {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(255, 250, 242, 0.26);
  border-radius: 23px;
  pointer-events: none;
}

.menu-topline {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 25px;
  margin-bottom: 8px;
}

.menu-kicker {
  position: absolute;
  left: 1px;
  color: rgba(112, 83, 89, 0.56);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.2em;
  white-space: nowrap;
}

.menu-title {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: rgba(84, 61, 69, 0.88);
  font-size: 12px;
  letter-spacing: 0.22em;
}

.menu-title-spark {
  color: rgba(198, 156, 143, 0.65);
  font-size: 8px;
}

.menu-collapse {
  position: absolute;
  right: -4px;
  top: 50%;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: rgba(126, 101, 103, 0.5);
  background: rgba(255, 251, 243, 0.4);
  transform: translateY(-50%);
  transition:
    color 0.3s ease,
    background 0.3s ease;
}

.menu-collapse:hover {
  color: rgba(126, 101, 103, 0.85);
  background: rgba(255, 251, 243, 0.8);
}

.menu-items {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 9px;
}

.menu-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 0;
  padding: 10px 5px 8px;
  border: 1px solid transparent;
  border-radius: 18px;
  color: rgba(76, 56, 64, 0.92);
  background: transparent;
  transition:
    transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1),
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
  animation: item-in 0.9s ease calc(0.18s + var(--item-index) * 0.06s) both;
}

.menu-item:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 250, 242, 0.5);
  background: rgba(255, 250, 242, 0.36);
  box-shadow: 0 10px 22px rgba(121, 94, 94, 0.1);
}

.menu-icon {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  border: 1px solid rgba(255, 250, 242, 0.7);
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.8), transparent 42%),
    rgba(248, 236, 224, 0.56);
  box-shadow: inset 0 0 14px rgba(255, 255, 255, 0.25);
}

.menu-icon svg {
  width: 23px;
  height: 23px;
  fill: none;
  stroke: rgba(112, 78, 84, 0.84);
  stroke-width: 1.15;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.menu-icon svg text {
  fill: rgba(158, 113, 119, 0.82);
  stroke: none;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 11px;
}

.menu-icon .icon-accent {
  fill: rgba(213, 158, 165, 0.24);
  stroke: rgba(185, 126, 136, 0.72);
}

.menu-item-anniversary .menu-icon {
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.8), transparent 42%),
    rgba(245, 218, 220, 0.45);
}

.menu-item-play .menu-icon {
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.8), transparent 42%),
    rgba(237, 224, 208, 0.48);
}

.menu-item-letter .menu-icon {
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.8), transparent 42%),
    rgba(233, 224, 241, 0.5);
}

.menu-label {
  font-size: 13px;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.menu-en {
  color: rgba(119, 88, 94, 0.54);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 7.5px;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.menu-reopen {
  position: absolute;
  left: 50%;
  bottom: calc(25px + env(safe-area-inset-bottom));
  z-index: 21;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 15px;
  border: 1px solid rgba(171, 132, 128, 0.28);
  border-radius: 999px;
  color: rgba(84, 62, 69, 0.82);
  background: rgba(255, 250, 242, 0.86);
  box-shadow: 0 12px 30px rgba(103, 76, 80, 0.18);
  backdrop-filter: blur(14px);
  transform: translateX(-50%);
  animation: menu-rise 0.7s ease both;
}

.reopen-spark {
  color: rgba(199, 153, 144, 0.72);
  font-size: 9px;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.4s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}

@keyframes menu-rise {
  from {
    opacity: 0;
    transform: translate(-50%, 16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

@keyframes item-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 700px) {
  .memory-menu {
    bottom: calc(13px + env(safe-area-inset-bottom));
    width: calc(100vw - 18px);
    padding: 10px 10px 12px;
    border-radius: 22px;
  }

  .menu-topline {
    margin-bottom: 2px;
  }

  .menu-kicker {
    display: none;
  }

  .menu-items {
    gap: 2px;
  }

  .menu-item {
    padding: 7px 2px 5px;
    border-radius: 14px;
  }

  .menu-icon {
    width: 34px;
    height: 34px;
  }

  .menu-icon svg {
    width: 20px;
    height: 20px;
  }

  .menu-label {
    font-size: 11px;
  }

  .menu-en {
    font-size: 6px;
    letter-spacing: 0.08em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .memory-menu {
    animation-duration: 0.8s;
  }

  .menu-item {
    animation-duration: 0.5s;
  }
}
</style>
