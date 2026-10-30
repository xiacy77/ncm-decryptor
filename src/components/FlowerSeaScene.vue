<script setup>
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CuteAlien from '@/components/CuteAlien.vue'
import FlowerDecor from '@/components/FlowerDecor.vue'
import FlowerMeadow from '@/components/FlowerMeadow.vue'
import LoveTree from '@/components/LoveTree.vue'
import MemoryMenu from '@/components/MemoryMenu.vue'
import PetalField from '@/components/PetalField.vue'
import RisingFlowers from '@/components/RisingFlowers.vue'
import { COPY, TIMING } from '@/config/story'
import { useTypewriter } from '@/composables/useTypewriter'
import { AUDIO_KEY } from '@/keys'
import { rand } from '@/utils/math'

const props = defineProps({
  zooming: { type: Boolean, default: false },
  suspended: { type: Boolean, default: false },
  mode: { type: String, default: 'day' },
})

const emit = defineEmits(['open-panel'])

const audio = inject(AUDIO_KEY, null)
const { output, isDone, isTyping, play } = useTypewriter({ speed: 150 })

const contentVisible = ref(false)
const showDialogue = ref(false)
const menuVisible = ref(false)
const risingActive = ref(false)
const petalsActive = ref(false)

const pollenMotes = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: rand(3, 97),
  top: rand(10, 79),
  size: rand(1.6, 4.6),
  delay: rand(-12, 0),
  duration: rand(8, 17),
  drift: rand(-28, 34),
  opacity: rand(0.22, 0.66),
}))

const dreamBokeh = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  left: rand(2, 95),
  top: rand(6, 64),
  size: rand(22, 94),
  delay: rand(-18, 0),
  duration: rand(9, 19),
  opacity: rand(0.05, 0.18),
  drift: rand(-20, 26),
}))

const fireflies = Array.from({ length: 38 }, (_, index) => ({
  id: index,
  left: rand(4, 96),
  top: rand(42, 88),
  size: rand(2.2, 4.8),
  delay: rand(-14, 0),
  duration: rand(5, 11),
  drift: rand(-18, 22),
}))

const skyStars = Array.from({ length: 72 }, (_, index) => ({
  id: index,
  left: rand(2, 98),
  top: rand(2, 46),
  size: rand(1, 2.9),
  delay: rand(-8, 0),
  duration: rand(3.2, 8.2),
  opacity: rand(0.18, 0.64),
}))

const timers = new Set()

const later = (callback, delay) => {
  const timer = setTimeout(() => {
    timers.delete(timer)
    callback()
  }, delay)
  timers.add(timer)
  return timer
}

let menuQueued = false

function handleMenuSelect(id) {
  emit('open-panel', id)
}

watch(isDone, (done) => {
  if (!done || menuQueued) return
  menuQueued = true
  later(() => {
    showDialogue.value = false
  }, 600)
  later(() => {
    menuVisible.value = true
    risingActive.value = true
    audio?.playChime()
  }, TIMING.bloom.menuDelayAfterDialogue)
})

onMounted(() => {
  later(() => {
    contentVisible.value = true
  }, TIMING.bloom.contentDelay)

  later(() => {
    petalsActive.value = true
  }, 900)

  later(() => {
    showDialogue.value = true
    play(COPY.bloomDialogue, { startDelay: 380 })
  }, TIMING.bloom.contentDelay + TIMING.bloom.dialogueDelay)
})

onBeforeUnmount(() => {
  for (const timer of timers) clearTimeout(timer)
  timers.clear()
})
</script>

<template>
  <section
    class="flower-scene"
    :class="{
      'is-zooming': zooming,
      'is-suspended': suspended,
      'is-day': mode === 'day',
      'is-night': mode === 'night',
    }"
  >
    <div class="bloom-world">
      <div class="day-sky" aria-hidden="true">
        <span class="day-sun-halo"></span>
        <span class="day-sun"></span>
        <span class="day-cloud day-cloud-a"></span>
        <span class="day-cloud day-cloud-b"></span>
        <span class="day-cloud day-cloud-c"></span>
        <span class="day-rays"></span>
        <span class="day-haze"></span>
        <span class="day-bokeh day-bokeh-a"></span>
        <span class="day-bokeh day-bokeh-b"></span>
        <span class="day-bokeh day-bokeh-c"></span>
      </div>

      <div class="sky-wash" aria-hidden="true">
        <span class="milky-way"></span>
        <span class="aurora aurora-one"></span>
        <span class="aurora aurora-two"></span>
        <span class="sky-blob blob-one"></span>
        <span class="sky-blob blob-two"></span>
        <span class="sky-blob blob-three"></span>
        <span class="cloud-wisp cloud-one"></span>
        <span class="cloud-wisp cloud-two"></span>
        <span class="sun-haze"></span>
        <span class="moon-iris"></span>
        <span class="moon-halo"></span>
        <svg class="crescent-moon" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M63 7A45 45 0 1 0 93 68 37 37 0 1 1 63 7Z" />
        </svg>
        <div class="sky-stars">
          <span
            v-for="star in skyStars"
            :key="star.id"
            :style="{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              '--star-delay': `${star.delay}s`,
              '--star-duration': `${star.duration}s`,
            }"
          ></span>
        </div>
        <div class="dream-bokeh">
          <span
            v-for="bokeh in dreamBokeh"
            :key="bokeh.id"
            class="bokeh-orb"
            :style="{
              left: `${bokeh.left}%`,
              top: `${bokeh.top}%`,
              width: `${bokeh.size}px`,
              height: `${bokeh.size}px`,
              opacity: bokeh.opacity,
              '--bokeh-delay': `${bokeh.delay}s`,
              '--bokeh-duration': `${bokeh.duration}s`,
              '--bokeh-drift': `${bokeh.drift}px`,
            }"
          ></span>
        </div>
        <span class="dream-prism"></span>
        <span class="dream-rays"></span>
        <span class="light-veil"></span>
      </div>

      <FlowerMeadow />
      <LoveTree :visible="mode === 'day'" />
      <FlowerDecor :mode="mode" />
      <div class="foreground-glow glow-left" aria-hidden="true"></div>
      <div class="foreground-glow glow-right" aria-hidden="true"></div>
      <PetalField :active="petalsActive" :density="2.05" />
      <RisingFlowers :active="risingActive && !zooming" />

      <div class="pollen-motes" aria-hidden="true">
        <span
          v-for="mote in pollenMotes"
          :key="mote.id"
          class="pollen"
          :style="{
            left: `${mote.left}%`,
            top: `${mote.top}%`,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            opacity: mote.opacity,
            '--mote-delay': `${mote.delay}s`,
            '--mote-duration': `${mote.duration}s`,
            '--mote-drift': `${mote.drift}px`,
          }"
        ></span>
      </div>

      <div class="fireflies" aria-hidden="true">
        <span
          v-for="firefly in fireflies"
          :key="firefly.id"
          :style="{
            left: `${firefly.left}%`,
            top: `${firefly.top}%`,
            width: `${firefly.size}px`,
            height: `${firefly.size}px`,
            '--firefly-delay': `${firefly.delay}s`,
            '--firefly-duration': `${firefly.duration}s`,
            '--firefly-drift': `${firefly.drift}px`,
          }"
        ></span>
      </div>

      <div class="meadow-mist" aria-hidden="true"></div>
      <div class="horizon-pearl" aria-hidden="true"></div>
    </div>

    <div v-if="contentVisible" class="scene-ui" :class="{ 'is-leaving': zooming }">
      <Transition name="dialogue">
        <div v-if="showDialogue" class="dialogue-wrap">
          <div class="blink-face" aria-hidden="true">
            <span class="face-eye eye-left"></span>
            <span class="face-eye eye-right"></span>
            <span class="face-blush blush-left"></span>
            <span class="face-blush blush-right"></span>
            <span class="face-mouth"></span>
          </div>

          <div class="dialogue-bubble" role="status" aria-live="polite">
            <p class="dialogue-text">
              {{ output }}<span v-if="isTyping" class="type-caret">|</span>
            </p>
            <span class="bubble-flower" aria-hidden="true">✿</span>
          </div>
        </div>
      </Transition>

      <MemoryMenu
        v-if="menuVisible"
        class="flower-menu"
        @select="handleMenuSelect"
      />

      <div class="flower-alien">
        <CuteAlien />
      </div>
    </div>

    <div class="scene-soft-edge" aria-hidden="true"></div>
  </section>
</template>

<style scoped>
.flower-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse 70% 50% at 50% 25%, rgba(255, 246, 231, 0.32), transparent 72%),
    linear-gradient(180deg, #697a9d 0%, #b7b3cc 38%, #ead4d5 66%, #c4d0bb 100%);
  perspective: 1200px;
}

.bloom-world {
  position: absolute;
  inset: 0;
  z-index: 1;
  transform-origin: 50% 55%;
  transition:
    transform 3.2s cubic-bezier(0.22, 0.61, 0.36, 1),
    filter 2.8s ease;
  will-change: transform, filter;
  animation: bloom-memory-reveal 3.6s cubic-bezier(0.18, 0.7, 0.3, 1) 0.05s both;
}

.flower-scene.is-zooming .bloom-world {
  transform: scale(1.24) translateY(-1.5%);
  filter: blur(4px) saturate(0.88) brightness(0.94);
}

.flower-scene.is-suspended .scene-ui {
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.flower-scene.is-day {
  background: linear-gradient(
    180deg,
    #7ea8c9 0%,
    #bad2e1 24%,
    #e8e4d6 50%,
    #f8e2d2 67%,
    #d5dfc4 84%,
    #a9c29d 100%
  );
}

.day-sky {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  opacity: 1;
  transition: opacity 1.8s ease;
  background:
    radial-gradient(ellipse 58% 42% at 70% 14%, rgba(255, 248, 227, 0.88), transparent 68%),
    radial-gradient(ellipse 60% 42% at 28% 28%, rgba(255, 255, 255, 0.24), transparent 75%),
    linear-gradient(
      180deg,
      #7aa6c9 0%,
      #b5d0e1 23%,
      #e5e4d7 48%,
      #f8e2d2 66%,
      #d6e0c6 83%,
      #a8c09b 100%
    );
}

.is-night .day-sky {
  opacity: 0;
}

.day-sun-halo {
  position: absolute;
  right: 4%;
  top: 1%;
  width: 34vmin;
  height: 34vmin;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 251, 232, 0.58) 0%,
    rgba(255, 243, 209, 0.22) 38%,
    transparent 72%
  );
  filter: blur(15px);
  animation: day-sun-breathe 9s ease-in-out infinite;
}

.day-sun {
  position: absolute;
  right: 16%;
  top: 11%;
  width: clamp(68px, 10vmin, 126px);
  height: clamp(68px, 10vmin, 126px);
  border-radius: 50%;
  background: radial-gradient(
    circle at 38% 32%,
    #fffdf0 0%,
    #fff4cd 38%,
    rgba(255, 221, 167, 0.72) 72%,
    rgba(255, 214, 157, 0.1) 100%
  );
  box-shadow:
    0 0 28px rgba(255, 238, 191, 0.5),
    0 0 70px rgba(255, 224, 171, 0.22);
  animation: day-sun-breathe 9s ease-in-out infinite;
}

.day-cloud {
  position: absolute;
  height: 9vh;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 28% 50%, rgba(255, 253, 247, 0.55), transparent 58%),
    radial-gradient(ellipse at 64% 42%, rgba(255, 250, 242, 0.38), transparent 62%);
  filter: blur(22px);
  opacity: 0.8;
  animation: day-cloud-drift 28s ease-in-out infinite alternate;
}

.day-cloud-a {
  left: -21%;
  top: 15%;
  width: 54vw;
  opacity: 0.34;
}

.day-cloud-b {
  right: -21%;
  top: 32%;
  width: 58vw;
  opacity: 0.25;
  animation-delay: -9s;
}

.day-cloud-c {
  left: 8%;
  top: 48%;
  width: 46vw;
  opacity: 0.18;
  animation-delay: -17s;
}

.day-rays {
  position: absolute;
  left: 50%;
  top: -28%;
  width: 80vw;
  height: 128vh;
  transform: translateX(-50%);
  background: conic-gradient(
    from 172deg at 50% 0%,
    transparent 0deg,
    rgba(255, 249, 228, 0.2) 7deg,
    transparent 15deg,
    rgba(255, 246, 220, 0.14) 22deg,
    transparent 31deg,
    rgba(255, 252, 235, 0.12) 38deg,
    transparent 47deg
  );
  filter: blur(17px);
  mix-blend-mode: screen;
  opacity: 0.45;
  animation: day-rays-breathe 13s ease-in-out infinite alternate;
}

.day-haze {
  position: absolute;
  left: 50%;
  bottom: 30%;
  width: 80vw;
  height: 24vh;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    rgba(255, 246, 222, 0.38) 0%,
    rgba(255, 232, 209, 0.16) 40%,
    transparent 75%
  );
  filter: blur(20px);
  transform: translateX(-50%);
}

.day-bokeh {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 253, 241, 0.74),
    rgba(255, 244, 217, 0.15) 55%,
    transparent 74%
  );
  filter: blur(4px);
  mix-blend-mode: screen;
  opacity: 0.28;
  animation: day-bokeh-float 11s ease-in-out infinite alternate;
}

.day-bokeh-a {
  left: 18%;
  top: 12%;
  width: 74px;
  height: 74px;
}

.day-bokeh-b {
  right: 22%;
  top: 41%;
  width: 46px;
  height: 46px;
  opacity: 0.18;
  animation-delay: -4s;
}

.day-bokeh-c {
  left: 42%;
  top: 28%;
  width: 28px;
  height: 28px;
  opacity: 0.14;
  animation-delay: -8s;
}

.sky-wash {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  transition: opacity 1.8s ease;
  background:
    radial-gradient(ellipse 60% 38% at 52% 9%, rgba(255, 248, 235, 0.3), transparent 72%),
    radial-gradient(ellipse 58% 40% at 78% 25%, rgba(247, 222, 208, 0.28), transparent 74%),
    radial-gradient(ellipse 48% 36% at 22% 16%, rgba(162, 179, 216, 0.38), transparent 75%),
    linear-gradient(
      180deg,
      #334666 0%,
      #586a91 15%,
      #837d9e 31%,
      #b098a9 47%,
      #d4b3b9 61%,
      #d9c1b8 72%,
      #b3c0a8 86%,
      #839a84 100%
    );
}

.flower-scene::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 7;
  pointer-events: none;
  background:
    linear-gradient(
      180deg,
      rgba(39, 51, 82, 0.4) 0%,
      rgba(45, 55, 87, 0.1) 21%,
      transparent 40%
    ),
    radial-gradient(ellipse 88% 74% at 50% 38%, transparent 56%, rgba(65, 59, 84, 0.12) 100%);
}

.milky-way {
  position: absolute;
  left: -16%;
  top: 2%;
  width: 132%;
  height: 34%;
  transform: rotate(-11deg);
  background:
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 248, 234, 0.08) 22%,
      rgba(234, 224, 240, 0.22) 47%,
      rgba(255, 244, 228, 0.13) 70%,
      transparent 100%
    );
  filter: blur(23px);
  opacity: 0.55;
}

.aurora {
  position: absolute;
  height: 22vh;
  border-radius: 50%;
  filter: blur(34px);
  opacity: 0.28;
  mix-blend-mode: screen;
  animation: aurora-drift 18s ease-in-out infinite alternate;
}

.aurora-one {
  width: 70vw;
  left: -12vw;
  top: 5vh;
  background: linear-gradient(90deg, transparent, rgba(196, 202, 235, 0.45), transparent);
  transform: rotate(8deg);
}

.aurora-two {
  width: 58vw;
  right: -14vw;
  top: 17vh;
  background: linear-gradient(90deg, transparent, rgba(239, 200, 206, 0.36), transparent);
  transform: rotate(-12deg);
  animation-delay: -7s;
}

.sky-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(42px);
  opacity: 0.46;
}

.blob-one {
  width: 48vw;
  height: 30vw;
  left: -8vw;
  top: 4vh;
  background: rgba(162, 175, 214, 0.36);
}

.blob-two {
  width: 52vw;
  height: 28vw;
  right: -10vw;
  top: 18vh;
  background: rgba(232, 196, 207, 0.38);
}

.blob-three {
  width: 58vw;
  height: 38vw;
  left: 18vw;
  bottom: -10vh;
  background: rgba(203, 216, 194, 0.42);
}

.cloud-wisp {
  position: absolute;
  height: 8vh;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 239, 224, 0.16) 25%,
    rgba(249, 222, 224, 0.22) 48%,
    rgba(224, 218, 239, 0.14) 70%,
    transparent
  );
  filter: blur(24px);
  mix-blend-mode: screen;
  animation: cloud-drift 26s ease-in-out infinite alternate;
}

.cloud-one {
  left: 4%;
  top: 31%;
  width: 64vw;
  opacity: 0.42;
}

.cloud-two {
  right: -8%;
  top: 21%;
  width: 58vw;
  opacity: 0.28;
  animation-delay: -11s;
}

.sun-haze {
  position: absolute;
  left: 58%;
  top: 16%;
  width: 30vw;
  height: 30vw;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 246, 229, 0.18) 0%,
    rgba(247, 222, 208, 0.06) 34%,
    transparent 68%
  );
  filter: blur(18px);
}

.moon-iris {
  position: absolute;
  right: 7.5%;
  top: 7%;
  width: 28vmin;
  height: 28vmin;
  border-radius: 50%;
  opacity: 0.3;
  background: conic-gradient(
    from 20deg,
    rgba(255, 225, 196, 0.12),
    rgba(215, 184, 216, 0.36),
    rgba(174, 204, 224, 0.24),
    rgba(249, 209, 195, 0.28),
    rgba(255, 238, 209, 0.1)
  );
  filter: blur(15px);
  mix-blend-mode: screen;
  animation: iris-turn 42s linear infinite;
}

.moon-halo {
  position: absolute;
  right: 11%;
  top: 11%;
  width: 18vmin;
  height: 18vmin;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 248, 231, 0.48) 0%,
    rgba(233, 221, 239, 0.14) 38%,
    transparent 72%
  );
  filter: blur(12px);
}

.crescent-moon {
  position: absolute;
  right: 13%;
  top: 13%;
  width: clamp(56px, 8vmin, 104px);
  height: clamp(56px, 8vmin, 104px);
  opacity: 0.72;
  filter: drop-shadow(0 0 18px rgba(255, 247, 226, 0.32));
  animation: moon-breathe 7s ease-in-out infinite alternate;
}

.crescent-moon path {
  fill: rgba(255, 248, 233, 0.84);
}

.sky-stars {
  position: absolute;
  inset: 0;
}

.sky-stars span {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 250, 238, 0.92);
  box-shadow: 0 0 7px rgba(255, 248, 231, 0.55);
  animation: sky-star-twinkle var(--star-duration) ease-in-out var(--star-delay) infinite
    alternate;
}

.dream-bokeh {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bokeh-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 250, 240, 0.95) 0%,
    rgba(246, 220, 224, 0.46) 35%,
    rgba(211, 219, 241, 0.12) 62%,
    transparent 74%
  );
  filter: blur(3px);
  mix-blend-mode: screen;
  animation: bokeh-drift var(--bokeh-duration) ease-in-out var(--bokeh-delay) infinite
    alternate;
}

.dream-prism {
  position: absolute;
  inset: -8%;
  background:
    conic-gradient(
      from 220deg at 46% 35%,
      transparent 0deg,
      rgba(255, 229, 209, 0.18) 55deg,
      rgba(223, 199, 231, 0.15) 126deg,
      transparent 192deg,
      rgba(184, 211, 229, 0.13) 255deg,
      transparent 340deg
    ),
    linear-gradient(108deg, transparent 30%, rgba(255, 247, 231, 0.18) 48%, transparent 66%);
  filter: blur(22px);
  mix-blend-mode: soft-light;
  opacity: 0.45;
  animation: prism-drift 34s ease-in-out infinite alternate;
}

.dream-rays {
  position: absolute;
  left: 50%;
  top: -32%;
  width: 88vw;
  height: 140vh;
  opacity: 0.16;
  background: conic-gradient(
    from 174deg at 50% 0%,
    transparent 0deg,
    rgba(255, 248, 233, 0.18) 7deg,
    transparent 15deg,
    rgba(241, 218, 231, 0.13) 21deg,
    transparent 29deg,
    rgba(255, 245, 225, 0.12) 34deg,
    transparent 43deg
  );
  filter: blur(18px);
  mix-blend-mode: screen;
  transform: translateX(-50%);
  animation: rays-breathe 17s ease-in-out infinite alternate;
}

.light-veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(116deg, transparent 22%, rgba(255, 248, 235, 0.13) 43%, transparent 58%),
    linear-gradient(70deg, transparent 58%, rgba(255, 249, 238, 0.1) 76%, transparent 90%);
  mix-blend-mode: soft-light;
  opacity: 0.3;
}

.is-day .sky-wash {
  opacity: 0;
}

.is-day .fireflies {
  opacity: 0;
}

.is-day::after {
  background:
    linear-gradient(180deg, rgba(255, 249, 238, 0.24) 0%, transparent 28%),
    radial-gradient(ellipse 88% 74% at 50% 38%, transparent 65%, rgba(255, 241, 218, 0.08) 100%);
}

.is-day .scene-soft-edge {
  background:
    radial-gradient(ellipse 80% 70% at 50% 45%, transparent 60%, rgba(255, 244, 221, 0.08) 100%),
    linear-gradient(
      180deg,
      rgba(255, 250, 238, 0.22),
      transparent 18%,
      transparent 82%,
      rgba(253, 239, 216, 0.14)
    );
}

.is-day .meadow-mist {
  background:
    radial-gradient(ellipse 46% 100% at 50% 100%, rgba(255, 252, 235, 0.44), transparent 72%),
    linear-gradient(180deg, transparent, rgba(255, 249, 229, 0.24));
}

.is-day .foreground-glow.glow-left {
  background: radial-gradient(
    circle,
    rgba(255, 228, 205, 0.36) 0%,
    rgba(255, 242, 216, 0.18) 42%,
    transparent 72%
  );
}

.is-day .foreground-glow.glow-right {
  background: radial-gradient(
    circle,
    rgba(205, 227, 219, 0.3) 0%,
    rgba(255, 239, 219, 0.14) 43%,
    transparent 72%
  );
}

.flower-alien {
  position: absolute;
  left: clamp(18px, 5.8vw, 92px);
  bottom: 23%;
  z-index: 19;
}

.is-night .flower-alien {
  bottom: 20%;
}

.pollen-motes {
  position: absolute;
  inset: 0;
  z-index: 5;
  overflow: hidden;
  pointer-events: none;
}

.pollen {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 252, 240, 0.96), rgba(242, 224, 203, 0.12) 64%, transparent);
  box-shadow: 0 0 9px rgba(255, 249, 235, 0.46);
  animation: pollen-float var(--mote-duration) ease-in-out var(--mote-delay) infinite alternate;
  will-change: transform, opacity;
}

.foreground-glow {
  position: absolute;
  bottom: -11%;
  z-index: 2;
  width: 52vw;
  height: 36vh;
  border-radius: 50%;
  filter: blur(30px);
  pointer-events: none;
}

.glow-left {
  left: -18%;
  background: radial-gradient(
    circle,
    rgba(251, 218, 216, 0.4) 0%,
    rgba(242, 231, 205, 0.18) 42%,
    transparent 72%
  );
}

.glow-right {
  right: -18%;
  background: radial-gradient(
    circle,
    rgba(211, 219, 237, 0.34) 0%,
    rgba(229, 217, 232, 0.16) 43%,
    transparent 72%
  );
}

.fireflies {
  position: absolute;
  inset: 0;
  z-index: 6;
  overflow: hidden;
  pointer-events: none;
  transition: opacity 1.5s ease;
}

.fireflies span {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 246, 205, 0.98);
  box-shadow:
    0 0 9px rgba(255, 241, 184, 0.95),
    0 0 20px rgba(240, 196, 181, 0.5),
    0 0 35px rgba(240, 196, 181, 0.18);
  opacity: 0;
  animation: firefly-drift var(--firefly-duration) ease-in-out var(--firefly-delay) infinite;
}

.meadow-mist {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 28vh;
  z-index: 3;
  background:
    radial-gradient(ellipse 46% 100% at 50% 100%, rgba(255, 245, 225, 0.38), transparent 72%),
    linear-gradient(180deg, transparent, rgba(239, 237, 219, 0.3));
  pointer-events: none;
}

.horizon-pearl {
  position: absolute;
  left: 50%;
  bottom: 8%;
  width: 74vw;
  height: 18vh;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    rgba(255, 250, 234, 0.3) 0%,
    rgba(245, 224, 213, 0.13) 38%,
    transparent 74%
  );
  filter: blur(20px);
  transform: translateX(-50%);
  pointer-events: none;
}

.scene-ui {
  position: absolute;
  inset: 0;
  z-index: 10;
  transition:
    opacity 0.55s ease,
    transform 0.55s ease;
}

.scene-ui.is-leaving {
  opacity: 0;
  transform: translateY(-1.5%);
  transition:
    opacity 2.4s ease,
    transform 2.4s ease;
}

.dialogue-wrap {
  position: absolute;
  left: 50%;
  bottom: clamp(42px, 10vh, 108px);
  z-index: 14;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  width: min(640px, 90vw);
  transform: translateX(-50%);
  pointer-events: none;
}

.blink-face {
  position: relative;
  flex: 0 0 auto;
  width: clamp(46px, 5.2vw, 62px);
  height: clamp(46px, 5.2vw, 62px);
  border: 1px solid rgba(255, 250, 243, 0.6);
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 28%, rgba(255, 255, 255, 0.8), transparent 36%),
    linear-gradient(145deg, #fbf2e7, #f0dcd9);
  box-shadow:
    0 12px 26px rgba(137, 107, 111, 0.16),
    inset 0 0 20px rgba(255, 255, 255, 0.4);
}

.face-eye {
  position: absolute;
  top: 43%;
  width: clamp(2px, 0.3vw, 3.4px);
  height: clamp(5px, 0.8vw, 8px);
  border-radius: 999px;
  background: #87717a;
  transform-origin: center;
  animation: face-blink 5.2s ease-in-out infinite;
}

.eye-left {
  left: 33%;
}

.eye-right {
  right: 33%;
  animation-delay: 0.04s;
}

.face-blush {
  position: absolute;
  top: 57%;
  width: 10px;
  height: 5px;
  border-radius: 50%;
  background: rgba(224, 165, 172, 0.32);
  filter: blur(1px);
}

.blush-left {
  left: 19%;
}

.blush-right {
  right: 19%;
}

.face-mouth {
  position: absolute;
  left: 50%;
  bottom: 24%;
  width: 8px;
  height: 5px;
  border-bottom: 1.5px solid rgba(133, 102, 103, 0.6);
  border-radius: 0 0 50% 50%;
  transform: translateX(-50%);
}

.dialogue-bubble {
  position: relative;
  flex: 1;
  min-height: 66px;
  display: flex;
  align-items: center;
  padding: 15px 26px;
  border: 1px solid rgba(255, 251, 245, 0.72);
  border-radius: 24px 24px 24px 7px;
  background: linear-gradient(135deg, rgba(255, 250, 243, 0.88), rgba(244, 233, 222, 0.76));
  box-shadow:
    0 18px 40px rgba(122, 101, 101, 0.12),
    inset 0 0 30px rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(12px);
}

.dialogue-bubble::before {
  content: '';
  position: absolute;
  left: -6px;
  bottom: 16px;
  width: 12px;
  height: 12px;
  border-left: 1px solid rgba(255, 251, 245, 0.72);
  border-bottom: 1px solid rgba(255, 251, 245, 0.72);
  background: rgba(252, 245, 237, 0.82);
  transform: rotate(45deg);
  border-radius: 0 0 0 5px;
}

.dialogue-text {
  margin: 0;
  color: #5f5156;
  font-family: var(--font-display);
  font-size: clamp(20px, 2.5vw, 30px);
  letter-spacing: 0.12em;
  line-height: 1.65;
}

.type-caret {
  display: inline-block;
  margin-left: 2px;
  color: rgba(132, 103, 108, 0.52);
  font-weight: 300;
  animation: caret-blink 0.9s steps(2, end) infinite;
}

.bubble-flower {
  position: absolute;
  right: 12px;
  top: 8px;
  color: rgba(203, 164, 172, 0.55);
  font-size: 13px;
}

.scene-soft-edge {
  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 70% at 50% 45%, transparent 55%, rgba(79, 74, 96, 0.15) 100%),
    linear-gradient(
      180deg,
      rgba(54, 65, 97, 0.16),
      transparent 15%,
      transparent 80%,
      rgba(75, 89, 68, 0.18)
    );
}

.dialogue-enter-active {
  transition:
    opacity 1.1s ease,
    transform 1.1s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.dialogue-leave-active {
  transition:
    opacity 0.9s ease,
    transform 0.9s ease;
}

.dialogue-enter-from,
.dialogue-leave-to {
  opacity: 0;
  transform: translate(-50%, 18px);
}

@keyframes bloom-memory-reveal {
  0% {
    opacity: 0;
    transform: scale(1.07);
    filter: blur(14px) brightness(1.4) saturate(0.72);
  }
  36% {
    opacity: 1;
    filter: blur(4px) brightness(1.12) saturate(0.86);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0) brightness(1) saturate(1);
  }
}

@keyframes aurora-drift {
  from {
    opacity: 0.22;
    transform: translate3d(-2vw, 0, 0) rotate(6deg) scaleX(0.94);
  }
  to {
    opacity: 0.42;
    transform: translate3d(3vw, -2vh, 0) rotate(10deg) scaleX(1.08);
  }
}

@keyframes day-sun-breathe {
  0%,
  100% {
    opacity: 0.78;
    transform: scale(0.97);
  }
  50% {
    opacity: 1;
    transform: scale(1.04);
  }
}

@keyframes day-cloud-drift {
  from {
    opacity: 0.4;
    transform: translate3d(-2vw, 1vh, 0) scaleX(0.96);
  }
  to {
    opacity: 0.78;
    transform: translate3d(3vw, -1vh, 0) scaleX(1.06);
  }
}

@keyframes day-rays-breathe {
  from {
    opacity: 0.28;
    transform: translateX(-50%) scaleX(0.96);
  }
  to {
    opacity: 0.54;
    transform: translateX(-50%) scaleX(1.06);
  }
}

@keyframes day-bokeh-float {
  from {
    opacity: 0.12;
    transform: translate3d(0, 5px, 0) scale(0.9);
  }
  to {
    opacity: 0.38;
    transform: translate3d(8px, -13px, 0) scale(1.1);
  }
}

@keyframes iris-turn {
  from {
    transform: rotate(0deg) scale(0.96);
  }
  to {
    transform: rotate(360deg) scale(1.04);
  }
}

@keyframes cloud-drift {
  from {
    opacity: 0.36;
    transform: translate3d(-2vw, 1vh, 0) scaleX(0.96);
  }
  to {
    opacity: 0.72;
    transform: translate3d(3vw, -1vh, 0) scaleX(1.05);
  }
}

@keyframes bokeh-drift {
  from {
    opacity: 0.2;
    transform: translate3d(0, 8px, 0) scale(0.92);
  }
  to {
    opacity: 0.62;
    transform: translate3d(var(--bokeh-drift), -17px, 0) scale(1.1);
  }
}

@keyframes prism-drift {
  from {
    transform: rotate(-2deg) scale(1);
    opacity: 0.62;
  }
  to {
    transform: rotate(3deg) scale(1.04);
    opacity: 0.9;
  }
}

@keyframes rays-breathe {
  from {
    opacity: 0.22;
    transform: translateX(-50%) scaleX(0.96);
  }
  to {
    opacity: 0.42;
    transform: translateX(-50%) scaleX(1.05);
  }
}

@keyframes firefly-drift {
  0% {
    opacity: 0;
    transform: translate3d(0, 6px, 0) scale(0.7);
  }
  18% {
    opacity: 0.72;
  }
  55% {
    opacity: 0.55;
    transform: translate3d(var(--firefly-drift), -15px, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate3d(-9px, -29px, 0) scale(1.2);
  }
}

@keyframes moon-breathe {
  from {
    opacity: 0.54;
    transform: scale(0.96);
  }
  to {
    opacity: 0.82;
    transform: scale(1.035);
  }
}

@keyframes sky-star-twinkle {
  0% {
    opacity: 0.1;
    transform: scale(0.65);
  }
  100% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

@keyframes pollen-float {
  0% {
    transform: translate3d(0, 0, 0) scale(0.82);
    opacity: 0.18;
  }
  55% {
    opacity: 0.62;
  }
  100% {
    transform: translate3d(var(--mote-drift), -34px, 0) scale(1.15);
    opacity: 0.42;
  }
}

@keyframes face-blink {
  0%,
  90%,
  100% {
    transform: scaleY(1);
  }
  93%,
  96% {
    transform: scaleY(0.12);
  }
}

@keyframes caret-blink {
  0%,
  100% {
    opacity: 0.18;
  }
  50% {
    opacity: 0.75;
  }
}

@media (max-width: 700px) {
  .dialogue-wrap {
    bottom: calc(32px + env(safe-area-inset-bottom));
    gap: 10px;
    width: 91vw;
    align-items: flex-end;
  }

  .dialogue-bubble {
    padding: 13px 18px;
    min-height: 58px;
    border-radius: 20px 20px 20px 6px;
  }

  .blink-face {
    width: 46px;
    height: 46px;
  }

  .flower-alien {
    left: 14px;
    bottom: 18%;
  }

  .is-night .flower-alien {
    bottom: 17%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bloom-world {
    animation-duration: 4.2s;
  }
}
</style>
