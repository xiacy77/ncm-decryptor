<script setup>
import { computed } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  intense: { type: Boolean, default: false },
})

const motifs = [
  { icon: '♪', left: '8%', top: '18%', size: 30, delay: -2, duration: 15, rotate: -14, tone: 'blue' },
  { icon: '♫', left: '19%', top: '64%', size: 24, delay: -8, duration: 18, rotate: 10, tone: 'rose' },
  { icon: '♥', left: '28%', top: '27%', size: 12, delay: -5, duration: 13, rotate: 12, tone: 'gold' },
  { icon: '♬', left: '37%', top: '12%', size: 22, delay: -11, duration: 20, rotate: -8, tone: 'rose' },
  { icon: '♥', left: '46%', top: '83%', size: 10, delay: -3, duration: 14, rotate: -16, tone: 'blue' },
  { icon: '♪', left: '58%', top: '20%', size: 27, delay: -7, duration: 17, rotate: 14, tone: 'cream' },
  { icon: '♥', left: '67%', top: '72%', size: 13, delay: -1, duration: 12, rotate: 8, tone: 'rose' },
  { icon: '♫', left: '76%', top: '34%', size: 34, delay: -9, duration: 21, rotate: -12, tone: 'blue' },
  { icon: '♥', left: '84%', top: '15%', size: 9, delay: -6, duration: 16, rotate: 20, tone: 'gold' },
  { icon: '♪', left: '91%', top: '59%', size: 22, delay: -4, duration: 19, rotate: 8, tone: 'cream' },
  { icon: '♥', left: '13%', top: '86%', size: 9, delay: -10, duration: 15, rotate: -10, tone: 'rose' },
  { icon: '♬', left: '72%', top: '89%', size: 18, delay: -13, duration: 22, rotate: 12, tone: 'blue' },
]

const staffLines = [
  { left: '4%', top: '38%', width: 130, rotate: -12, delay: -4 },
  { left: '79%', top: '48%', width: 158, rotate: 9, delay: -9 },
]

const rootClass = computed(() => ({
  'is-active': props.active,
  'is-intense': props.intense,
}))
</script>

<template>
  <div class="motif-field" :class="rootClass" aria-hidden="true">
    <div
      v-for="(staff, index) in staffLines"
      :key="`staff-${index}`"
      class="staff"
      :style="{
        left: staff.left,
        top: staff.top,
        width: `${staff.width}px`,
        '--staff-rotate': `${staff.rotate}deg`,
        animationDelay: `${staff.delay}s`,
      }"
    >
      <span v-for="line in 4" :key="line" class="staff-line"></span>
      <i class="staff-note">♪</i>
    </div>

    <span
      v-for="(motif, index) in motifs"
      :key="`motif-${index}`"
      class="motif"
      :class="`tone-${motif.tone}`"
      :style="{
        left: motif.left,
        top: motif.top,
        fontSize: `${motif.size}px`,
        animationDelay: `${motif.delay}s`,
        animationDuration: `${motif.duration}s`,
        '--motif-rotate': `${motif.rotate}deg`,
      }"
    >
      {{ motif.icon }}
    </span>
  </div>
</template>

<style scoped>
.motif-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 2.4s ease;
  pointer-events: none;
  z-index: 2;
}

.motif-field.is-active {
  opacity: 0.52;
}

.motif-field.is-intense {
  opacity: 0.72;
}

.motif {
  position: absolute;
  display: block;
  line-height: 1;
  color: var(--cream);
  font-family: 'Georgia', 'Times New Roman', serif;
  opacity: 0.26;
  filter: blur(0.2px);
  text-shadow: 0 0 18px rgba(222, 228, 255, 0.35);
  animation: motif-drift 16s ease-in-out infinite alternate;
  will-change: transform;
}

.tone-blue {
  color: #cfd9f2;
}

.tone-rose {
  color: #e7c7d4;
}

.tone-gold {
  color: #eadfc6;
}

.tone-cream {
  color: #f7efe5;
}

.staff {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 6px;
  opacity: 0.16;
  filter: blur(0.4px);
  animation: staff-breathe 12s ease-in-out infinite alternate;
}

.staff-line {
  display: block;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(230, 233, 248, 0.8), transparent);
}

.staff-note {
  position: absolute;
  right: 16%;
  top: -16px;
  font-family: 'Georgia', serif;
  font-style: normal;
  font-size: 22px;
  color: rgba(243, 233, 221, 0.8);
}

@keyframes motif-drift {
  0% {
    transform: translate3d(0, 0, 0) rotate(var(--motif-rotate));
  }
  50% {
    transform: translate3d(11px, -17px, 0) rotate(calc(var(--motif-rotate) + 5deg));
  }
  100% {
    transform: translate3d(-7px, -28px, 0) rotate(var(--motif-rotate));
  }
}

@keyframes staff-breathe {
  from {
    opacity: 0.1;
    transform: translateY(0) rotate(var(--staff-rotate, 0deg));
  }
  to {
    opacity: 0.22;
    transform: translateY(-8px) rotate(var(--staff-rotate, 0deg));
  }
}
</style>
