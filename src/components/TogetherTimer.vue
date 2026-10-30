<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { TOGETHER_SINCE, UI } from '@/config/story'

const props = defineProps({
  mode: { type: String, default: 'day' },
})

const startDate = new Date(
  TOGETHER_SINCE.year,
  TOGETHER_SINCE.month - 1,
  TOGETHER_SINCE.day,
  TOGETHER_SINCE.hour,
  TOGETHER_SINCE.minute,
  TOGETHER_SINCE.second,
)

const days = ref(0)
const clock = ref('00:00:00')
const label = ref(UI.timer.aria)
let timer = null

const pad = (value) => String(value).padStart(2, '0')

function update(now = Date.now()) {
  const elapsed = Math.max(0, now - startDate.getTime())
  const totalSeconds = Math.floor(elapsed / 1000)
  const dayCount = Math.floor(totalSeconds / 86400)
  const remainder = totalSeconds % 86400
  const hours = Math.floor(remainder / 3600)
  const minutes = Math.floor((remainder % 3600) / 60)
  const seconds = remainder % 60
  days.value = dayCount
  clock.value = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  label.value = `${UI.timer.aria} ${dayCount} ${UI.timer.days} ${clock.value}`
}

function schedule() {
  update()
  const delay = 1000 - (Date.now() % 1000) + 25
  timer = setTimeout(schedule, delay)
}

onMounted(schedule)

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div
    class="together-timer"
    :class="`is-${props.mode}`"
    role="timer"
    :aria-label="label"
    :title="UI.timer.from"
  >
    <span class="timer-star timer-star-left" aria-hidden="true">✦</span>
    <span class="timer-star timer-star-right" aria-hidden="true">✦</span>

    <div class="timer-top">
      <span class="timer-heart" aria-hidden="true">♥</span>
      <span class="timer-label">{{ UI.timer.label }}</span>
    </div>

    <div class="timer-days">
      <strong>{{ days }}</strong>
      <span class="timer-unit">{{ UI.timer.days }}</span>
    </div>

    <div class="timer-clock">{{ clock }}</div>
  </div>
</template>

<style scoped>
.together-timer {
  position: fixed;
  left: 50%;
  top: clamp(145px, 27vh, 270px);
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  min-width: clamp(300px, 32vw, 440px);
  padding: 20px 38px 19px;
  border-radius: 34px;
  transform: translateX(-50%);
  pointer-events: none;
  backdrop-filter: blur(16px);
  animation: timer-in 1.4s ease 0.3s backwards;
}

.together-timer::before {
  content: '';
  position: absolute;
  inset: -16px;
  z-index: -1;
  border-radius: 44px;
  background:
    radial-gradient(ellipse at 50% 18%, rgba(255, 229, 206, 0.22), transparent 62%),
    radial-gradient(ellipse at 50% 100%, rgba(211, 179, 204, 0.12), transparent 72%);
  filter: blur(15px);
  pointer-events: none;
}

.together-timer::after {
  content: '✦   ✿   ✦';
  position: absolute;
  left: 50%;
  top: -18px;
  color: rgba(192, 147, 139, 0.5);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 9px;
  letter-spacing: 0.26em;
  transform: translateX(-50%);
  pointer-events: none;
  white-space: nowrap;
}

.is-night.together-timer::before {
  background:
    radial-gradient(ellipse at 50% 18%, rgba(255, 226, 186, 0.1), transparent 62%),
    radial-gradient(ellipse at 50% 100%, rgba(176, 158, 218, 0.09), transparent 72%);
}

.is-night.together-timer::after {
  color: rgba(244, 217, 183, 0.32);
}

.together-timer.is-day {
  border: 1px solid rgba(255, 252, 245, 0.8);
  color: #675157;
  background:
    radial-gradient(circle at 22% 12%, rgba(255, 255, 255, 0.55), transparent 34%),
    rgba(255, 250, 243, 0.54);
  box-shadow:
    0 22px 55px rgba(122, 91, 87, 0.13),
    inset 0 0 28px rgba(255, 255, 255, 0.36);
}

.together-timer.is-night {
  border: 1px solid rgba(255, 241, 222, 0.17);
  color: rgba(255, 246, 233, 0.9);
  background:
    radial-gradient(circle at 22% 12%, rgba(255, 250, 235, 0.08), transparent 34%),
    rgba(15, 19, 38, 0.58);
  box-shadow:
    0 24px 60px rgba(2, 4, 13, 0.3),
    inset 0 0 30px rgba(255, 244, 225, 0.035);
}

.timer-top {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 1px;
}

.timer-heart {
  color: rgba(198, 117, 133, 0.8);
  font-size: 11px;
  line-height: 1;
  animation: timer-heartbeat 2.6s ease-in-out infinite;
}

.is-night .timer-heart {
  color: rgba(240, 188, 177, 0.8);
}

.timer-label {
  color: rgba(103, 80, 84, 0.56);
  font-size: 12px;
  letter-spacing: 0.2em;
}

.is-night .timer-label {
  color: rgba(247, 234, 219, 0.54);
}

.timer-days {
  display: flex;
  align-items: baseline;
  gap: 6px;
  line-height: 1;
}

.timer-days strong {
  color: #7b535e;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(62px, 8.1vw, 102px);
  font-weight: 400;
  letter-spacing: -0.035em;
  line-height: 0.95;
  text-shadow: 0 7px 24px rgba(157, 107, 111, 0.12);
}

.is-night .timer-days strong {
  color: rgba(255, 240, 218, 0.94);
  text-shadow:
    0 0 22px rgba(255, 229, 190, 0.2),
    0 8px 26px rgba(2, 4, 13, 0.35);
}

.timer-unit {
  color: rgba(117, 86, 88, 0.58);
  font-size: 15px;
  letter-spacing: 0.12em;
}

.is-night .timer-unit {
  color: rgba(247, 231, 211, 0.56);
}

.timer-clock {
  margin-top: 4px;
  color: rgba(100, 76, 81, 0.72);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(15px, 1.35vw, 19px);
  letter-spacing: 0.22em;
  line-height: 1.1;
}

.is-night .timer-clock {
  color: rgba(255, 240, 219, 0.76);
}

.timer-star {
  position: absolute;
  color: rgba(198, 149, 142, 0.58);
  font-size: 8px;
  animation: timer-star-twinkle 3.8s ease-in-out infinite;
}

.is-night .timer-star {
  color: rgba(255, 221, 177, 0.62);
}

.timer-star-left {
  left: 17px;
  top: 19px;
}

.timer-star-right {
  right: 17px;
  bottom: 20px;
  font-size: 6px;
  animation-delay: -1.4s;
}

@keyframes timer-in {
  from {
    opacity: 0;
    transform: translate(-50%, 8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

@keyframes timer-heartbeat {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.62;
  }
  45% {
    transform: scale(1.22);
    opacity: 0.96;
  }
}

@keyframes timer-star-twinkle {
  0%,
  100% {
    opacity: 0.25;
    transform: scale(0.8) rotate(-8deg);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.15) rotate(8deg);
  }
}

@media (max-width: 700px) {
  .together-timer {
    top: clamp(118px, 24vh, 205px);
    min-width: min(310px, 84vw);
    padding: 15px 24px 14px;
    border-radius: 28px;
  }

  .timer-label {
    font-size: 10px;
  }

  .timer-days strong {
    font-size: clamp(56px, 16vw, 80px);
  }

  .timer-unit {
    font-size: 13px;
  }

  .timer-clock {
    margin-top: 3px;
    font-size: 14px;
    letter-spacing: 0.18em;
  }

  .timer-star {
    display: none;
  }
}

@media (max-height: 700px) and (min-width: 701px) {
  .together-timer {
    top: 18vh;
    padding-top: 12px;
    padding-bottom: 11px;
  }

  .timer-days strong {
    font-size: 56px;
  }
}
</style>
