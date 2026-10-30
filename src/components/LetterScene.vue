<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import StarDateCanvas from '@/components/StarDateCanvas.vue'
import WatercolorDaisy from '@/components/WatercolorDaisy.vue'
import { ANNIVERSARY_DATE, COPY, TIMING, UI } from '@/config/story'
import { useTypewriter } from '@/composables/useTypewriter'
import { rand } from '@/utils/math'

const emit = defineEmits(['open-fireworks', 'back'])

const { output, isTyping, isDone, play } = useTypewriter({
  speed: TIMING.letter.typeSpeed,
  linePause: TIMING.letter.linePause,
})

const dandelionIn = ref(false)
const showSeedCloud = ref(false)
const showEnvelope = ref(false)
const envelopeOpening = ref(false)
const showEnvelopeShell = ref(true)
const letterOpen = ref(false)
const heartsVisible = ref(false)
const showFooter = ref(false)
const showDate = ref(false)

const timers = new Set()

const later = (callback, delay) => {
  const timer = setTimeout(() => {
    timers.delete(timer)
    callback()
  }, delay)
  timers.add(timer)
  return timer
}

const dandelionSeeds = Array.from({ length: 22 }, (_, index) => {
  const angle = rand(-175, -5) * (Math.PI / 180)
  const distance = rand(120, 370)
  return {
    id: index,
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance - rand(10, 130),
    delay: rand(0, 0.8),
    size: rand(8, 17),
    rotate: rand(-60, 60),
    opacity: rand(0.35, 0.8),
  }
})

const heartColors = ['#d9aab7', '#c5b6d8', '#e1c6ae', '#d8bdc4', '#c9c0d3', '#e8d1ce']
const hearts = Array.from({ length: 132 }, (_, index) => ({
  id: index,
  left: rand(1, 97),
  top: rand(0, 98),
  size: rand(10, 34),
  delay: rand(0, 2.3),
  duration: rand(1.3, 2.9),
  driftX: rand(-32, 32),
  driftY: rand(-56, 22),
  rotate: rand(-38, 38),
  color: heartColors[index % heartColors.length],
  opacity: rand(0.34, 0.82),
  blur: Math.random() > 0.84 ? rand(1.2, 2.4) : 0,
}))

const letterMotes = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  left: rand(4, 96),
  top: rand(8, 90),
  size: rand(1.5, 4),
  delay: rand(-16, 0),
  duration: rand(9, 18),
  drift: rand(-30, 30),
}))

function openLetter() {
  if (envelopeOpening.value) return
  envelopeOpening.value = true
  later(() => {
    showEnvelopeShell.value = false
  }, 680)
  later(() => {
    letterOpen.value = true
  }, 760)
  later(() => {
    play(COPY.letterText, { startDelay: 620 })
  }, 1300)
}

function beginEnding() {
  if (heartsVisible.value) return
  heartsVisible.value = true
  later(() => {
    showFooter.value = true
  }, TIMING.letter.footerDelay)
  later(() => {
    showDate.value = true
  }, TIMING.letter.dateEchoAfter)
  later(() => {
    showDate.value = false
  }, TIMING.letter.dateEchoAfter + TIMING.letter.dateEchoDuration)
}

watch(isDone, (done) => {
  if (!done || heartsVisible.value) return
  later(() => {
    beginEnding()
  }, TIMING.letter.holdAfterTyping)
})

onMounted(() => {
  later(() => {
    dandelionIn.value = true
  }, 200)
  later(() => {
    showSeedCloud.value = true
  }, TIMING.letter.envelopeDelay - 520)
  later(() => {
    showEnvelope.value = true
  }, TIMING.letter.envelopeDelay)
})

onBeforeUnmount(() => {
  for (const timer of timers) clearTimeout(timer)
  timers.clear()
})
</script>

<template>
  <section class="letter-scene">
    <button
      type="button"
      class="letter-back"
      :aria-label="UI.letter.back"
      :title="UI.letter.back"
      @click="emit('back')"
    >
      <span aria-hidden="true">←</span>
      {{ UI.letter.back }}
    </button>

    <div class="letter-sky" aria-hidden="true">
      <span class="wash wash-a"></span>
      <span class="wash wash-b"></span>
      <span class="wash wash-c"></span>
      <span class="wash wash-d"></span>
      <span class="paper-sun"></span>
    </div>

    <div class="letter-motes" aria-hidden="true">
      <span
        v-for="(mote, index) in letterMotes"
        :key="`mote-${index}`"
        class="letter-mote"
        :style="{
          left: `${mote.left}%`,
          top: `${mote.top}%`,
          width: `${mote.size}px`,
          height: `${mote.size}px`,
          '--mote-delay': `${mote.delay}s`,
          '--mote-duration': `${mote.duration}s`,
          '--mote-drift': `${mote.drift}px`,
        }"
      ></span>
    </div>

    <div class="letter-flora" aria-hidden="true">
      <WatercolorDaisy
        class="flora-head flora-a"
        :size="118"
        petal-color="#e8cbd2"
        center-color="#c9a97b"
      />
      <WatercolorDaisy
        class="flora-head flora-b"
        :size="74"
        petal-color="#f1e2da"
        center-color="#c9a97b"
        :tilt="-14"
      />
      <WatercolorDaisy
        class="flora-head flora-c"
        :size="96"
        petal-color="#d9d2e6"
        center-color="#c6a679"
        :tilt="18"
      />
      <span class="flora-stem stem-a"></span>
      <span class="flora-stem stem-b"></span>
    </div>

    <div class="dandelion-layer" aria-hidden="true">
      <div
        class="dandelion-wrap"
        :class="{ 'is-in': dandelionIn, 'is-dispersing': showSeedCloud }"
      >
        <svg viewBox="0 0 520 660" class="dandelion-plant">
          <defs>
            <radialGradient id="dandelion-fluff" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fffdf7" stop-opacity="0.94" />
              <stop offset="68%" stop-color="#fff9ed" stop-opacity="0.55" />
              <stop offset="100%" stop-color="#fffaf0" stop-opacity="0.05" />
            </radialGradient>
            <filter id="dandelion-soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>
          <path
            d="M256 640 C 232 545 248 470 304 384"
            fill="none"
            stroke="#a3b09a"
            stroke-width="3.2"
            stroke-linecap="round"
            opacity="0.44"
          />
          <path
            d="M283 480 C 318 460 344 462 368 480"
            fill="none"
            stroke="#a4b49c"
            stroke-width="2.1"
            stroke-linecap="round"
            opacity="0.3"
          />
          <g transform="translate(308 338)">
            <circle r="184" fill="url(#dandelion-fluff)" opacity="0.22" filter="url(#dandelion-soft)" />
            <g class="dandelion-fluff">
              <line
                v-for="index in 52"
                :key="index"
                x1="0"
                y1="0"
                :x2="Math.cos((index / 52) * Math.PI * 2) * (116 + (index % 5) * 7)"
                :y2="Math.sin((index / 52) * Math.PI * 2) * (116 + (index % 5) * 7)"
                stroke="#fffdf6"
                :stroke-width="index % 3 === 0 ? 1.15 : 0.7"
                stroke-linecap="round"
                :opacity="index % 4 === 0 ? 0.82 : 0.58"
              />
              <circle
                v-for="index in 52"
                :key="`tip-${index}`"
                :cx="Math.cos((index / 52) * Math.PI * 2) * (116 + (index % 5) * 7)"
                :cy="Math.sin((index / 52) * Math.PI * 2) * (116 + (index % 5) * 7)"
                :r="index % 4 === 0 ? 3.1 : 2.1"
                fill="#fffdf7"
                :opacity="index % 5 === 0 ? 0.92 : 0.65"
              />
            </g>
            <circle r="28" fill="#f8eddc" opacity="0.54" />
            <circle r="10" fill="#e9d9bd" opacity="0.5" />
          </g>
        </svg>

        <div v-if="showSeedCloud" class="seed-cloud">
          <span
            v-for="seed in dandelionSeeds"
            :key="seed.id"
            class="flying-seed"
            :style="{
              '--dx': `${seed.dx}px`,
              '--dy': `${seed.dy}px`,
              '--seed-delay': `${seed.delay}s`,
              '--seed-size': `${seed.size}px`,
              '--seed-rotate': `${seed.rotate}deg`,
              opacity: seed.opacity,
            }"
          >
            <svg viewBox="0 0 44 64" width="100%" height="100%">
              <g fill="none" stroke="rgba(255, 252, 242, 0.94)" stroke-width="0.8" stroke-linecap="round">
                <line x1="22" y1="26" x2="22" y2="56" />
                <line x1="22" y1="25" x2="8" y2="10" />
                <line x1="22" y1="25" x2="18" y2="6" />
                <line x1="22" y1="25" x2="29" y2="6" />
                <line x1="22" y1="25" x2="37" y2="11" />
              </g>
              <circle cx="22" cy="25" r="1.2" fill="#fffdf7" />
            </svg>
          </span>
        </div>
      </div>
    </div>

    <Transition name="envelope-appear">
      <div v-if="showEnvelope && showEnvelopeShell" class="envelope-layer">
        <div class="envelope-float">
          <button
            type="button"
            class="envelope"
            :class="{ opening: envelopeOpening }"
            :aria-label="UI.letter.envelopeAria"
            @click="openLetter"
          >
            <span class="envelope-shadow" aria-hidden="true"></span>
            <span class="envelope-back" aria-hidden="true"></span>
            <span class="envelope-flap" aria-hidden="true"></span>
            <span class="envelope-front" aria-hidden="true"></span>
            <svg class="envelope-flourish" viewBox="0 0 360 220" aria-hidden="true">
              <path
                d="M24 190c38-24 50-54 43-88M336 190c-38-24-50-54-43-88"
                fill="none"
                stroke="#b68c72"
                stroke-width="1.2"
                stroke-linecap="round"
                opacity=".54"
              />
              <path
                d="M50 174c-14-4-25 1-31 12 13 4 24 0 31-12ZM63 150c-12-8-23-6-31 3 11 7 22 6 31-3ZM306 174c14-4 25 1 31 12-13 4-24 0-31-12ZM293 150c12-8 23-6 31 3-11 7-22 6-31-3Z"
                fill="#aeb99f"
                opacity=".58"
              />
              <g transform="translate(58 112) rotate(-12)" opacity=".82">
                <circle r="8" fill="#c7838e" opacity=".66" />
                <path d="M0-12c6 4 6 11 0 16-6-5-6-12 0-16Z" fill="#dca4ac" />
                <path d="M-11-2c6-4 12-1 14 5-6 4-12 1-14-5Z" fill="#dca4ac" />
                <path d="M11-2c-6-4-12-1-14 5 6 4 12 1 14-5Z" fill="#dca4ac" />
                <circle r="3.5" fill="#8e5d64" opacity=".5" />
              </g>
              <g transform="translate(302 112) rotate(12)" opacity=".82">
                <circle r="8" fill="#c7838e" opacity=".66" />
                <path d="M0-12c6 4 6 11 0 16-6-5-6-12 0-16Z" fill="#dca4ac" />
                <path d="M-11-2c6-4 12-1 14 5-6 4-12 1-14-5Z" fill="#dca4ac" />
                <path d="M11-2c-6-4-12-1-14 5 6 4 12 1 14-5Z" fill="#dca4ac" />
                <circle r="3.5" fill="#8e5d64" opacity=".5" />
              </g>
            </svg>
            <span class="envelope-seal" aria-hidden="true">♥</span>
          </button>
        </div>
        <p class="envelope-hint">{{ COPY.letterHint }}</p>
      </div>
    </Transition>

    <Transition name="paper-rise">
      <article v-if="letterOpen" class="letter-paper" :aria-label="UI.letter.paperAria">
        <span class="paper-stain stain-a" aria-hidden="true"></span>
        <span class="paper-stain stain-b" aria-hidden="true"></span>
        <span class="paper-fold fold-left" aria-hidden="true"></span>
        <span class="paper-fold fold-right" aria-hidden="true"></span>
        <span class="paper-corner corner-top" aria-hidden="true"></span>
        <span class="paper-corner corner-bottom" aria-hidden="true"></span>
        <span class="letter-arrival" aria-hidden="true"></span>

        <svg class="paper-vine paper-vine-left" viewBox="0 0 140 310" aria-hidden="true">
          <path
            d="M12 300c46-54 30-99 17-136-12-33 2-62 34-86"
            fill="none"
            stroke="#b58b6d"
            stroke-width="1.25"
            stroke-linecap="round"
            opacity=".58"
          />
          <path
            d="M42 260c-15-6-27 0-33 12 15 5 26-1 33-12ZM58 225c-15-4-25 3-29 15 14 3 24-4 29-15ZM29 180c-15-2-24 5-27 18 14 2 23-6 27-18ZM66 135c-12-9-24-7-33 3 11 8 23 7 33-3Z"
            fill="#a9b69a"
            opacity=".62"
          />
          <g transform="translate(67 110) rotate(-16)" opacity=".8">
            <circle r="9" fill="#c98490" opacity=".66" />
            <path d="M0-14c7 5 7 13 0 18-7-5-7-13 0-18Z" fill="#dfa8b0" />
            <path d="M-13-3c7-4 14-1 17 6-7 4-14 1-17-6Z" fill="#dfa8b0" />
            <path d="M13-3c-7-4-14-1-17 6 7 4 14 1 17-6Z" fill="#dfa8b0" />
            <circle r="4" fill="#8d5d63" opacity=".48" />
          </g>
        </svg>
        <svg class="paper-vine paper-vine-right" viewBox="0 0 140 310" aria-hidden="true">
          <path
            d="M12 300c46-54 30-99 17-136-12-33 2-62 34-86"
            fill="none"
            stroke="#b58b6d"
            stroke-width="1.25"
            stroke-linecap="round"
            opacity=".58"
          />
          <path
            d="M42 260c-15-6-27 0-33 12 15 5 26-1 33-12ZM58 225c-15-4-25 3-29 15 14 3 24-4 29-15ZM29 180c-15-2-24 5-27 18 14 2 23-6 27-18ZM66 135c-12-9-24-7-33 3 11 8 23 7 33-3Z"
            fill="#a9b69a"
            opacity=".62"
          />
          <g transform="translate(67 110) rotate(16)" opacity=".8">
            <circle r="9" fill="#c98490" opacity=".66" />
            <path d="M0-14c7 5 7 13 0 18-7-5-7-13 0-18Z" fill="#dfa8b0" />
            <path d="M-13-3c7-4 14-1 17 6-7 4-14 1-17-6Z" fill="#dfa8b0" />
            <path d="M13-3c-7-4-14-1-17 6 7 4 14 1 17-6Z" fill="#dfa8b0" />
            <circle r="4" fill="#8d5d63" opacity=".48" />
          </g>
        </svg>

        <div class="letter-content">
          <p class="letter-text">
            {{ output }}<span v-if="isTyping" class="letter-caret">|</span>
          </p>
          <Transition name="letter-sign">
            <span v-if="isDone" class="letter-sign">♥</span>
          </Transition>

          <Transition name="celebrate-button">
            <button
              v-if="isDone"
              type="button"
              class="celebrate-button"
              @click="emit('open-fireworks')"
            >
              <span class="celebrate-spark sparkle-top" aria-hidden="true">✦</span>
              <span class="celebrate-label">{{ COPY.celebrationButton }}</span>
              <span class="celebrate-spark sparkle-bottom" aria-hidden="true">✦</span>
            </button>
          </Transition>
        </div>
      </article>
    </Transition>


    <div
      v-if="heartsVisible"
      class="hearts-field"
      aria-hidden="true"
    >
      <span
        v-for="heart in hearts"
        :key="heart.id"
        class="ending-heart"
        :style="{
          left: `${heart.left}%`,
          top: `${heart.top}%`,
          '--heart-size': `${heart.size}px`,
          '--heart-delay': `${heart.delay}s`,
          '--heart-duration': `${heart.duration}s`,
          '--heart-x': `${heart.driftX}px`,
          '--heart-y': `${heart.driftY}px`,
          '--heart-rotate': `${heart.rotate}deg`,
          '--heart-opacity': heart.opacity,
          '--heart-color': heart.color,
          filter: heart.blur ? `blur(${heart.blur}px)` : 'none',
        }"
      >
        ♥
      </span>
    </div>

    <Transition name="date-echo">
      <StarDateCanvas v-if="showDate" :text="ANNIVERSARY_DATE" color="#a17a5a" />
    </Transition>

    <Transition name="ending-footer">
      <p v-if="showFooter" class="ending-footer">{{ COPY.endingFooter }}</p>
    </Transition>

    <span class="end-wash" :class="{ visible: heartsVisible }" aria-hidden="true"></span>
  </section>
</template>

<style scoped>
.letter-scene {
  position: absolute;
  inset: 0;
  z-index: 30;
  overflow: hidden;
  background:
    radial-gradient(ellipse 76% 55% at 48% 22%, rgba(255, 252, 244, 0.94), transparent 70%),
    linear-gradient(180deg, #f4e9df 0%, #f8f0e2 42%, #f2e6d4 72%, #eaddcc 100%);
  animation: letter-scene-in 2.6s ease both;
  isolation: isolate;
}

.letter-back {
  position: absolute;
  left: max(16px, env(safe-area-inset-left));
  top: calc(16px + env(safe-area-inset-top));
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 35px;
  padding: 0 12px;
  border: 1px solid rgba(174, 143, 129, 0.24);
  border-radius: 999px;
  color: rgba(101, 78, 80, 0.66);
  background: rgba(255, 249, 239, 0.52);
  box-shadow: 0 8px 24px rgba(115, 88, 78, 0.08);
  backdrop-filter: blur(10px);
  font-size: 9px;
  letter-spacing: 0.07em;
  transition:
    color 0.3s ease,
    background 0.3s ease,
    transform 0.3s ease;
}

.letter-back:hover {
  color: rgba(101, 78, 80, 0.9);
  background: rgba(255, 250, 242, 0.8);
  transform: translateY(-1px);
}

.letter-back span {
  font-size: 15px;
  line-height: 1;
  font-weight: 300;
}

.letter-sky {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.wash {
  position: absolute;
  border-radius: 46% 54% 60% 40%;
  filter: blur(55px);
  opacity: 0.54;
  animation: wash-float 16s ease-in-out infinite alternate;
}

.wash-a {
  width: 48vw;
  height: 34vw;
  left: -14vw;
  top: -8vh;
  background: rgba(229, 197, 202, 0.46);
}

.wash-b {
  width: 52vw;
  height: 36vw;
  right: -18vw;
  top: 5vh;
  background: rgba(202, 207, 229, 0.4);
  animation-delay: -6s;
}

.wash-c {
  width: 55vw;
  height: 42vw;
  left: 12vw;
  bottom: -16vh;
  background: rgba(205, 214, 190, 0.38);
  animation-delay: -3s;
}

.wash-d {
  width: 30vw;
  height: 24vw;
  right: 18vw;
  bottom: -10vh;
  background: rgba(239, 218, 187, 0.4);
  animation-delay: -10s;
}

.paper-sun {
  position: absolute;
  left: 68%;
  top: 14%;
  width: 36vw;
  height: 36vw;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 251, 234, 0.66) 0%,
    rgba(249, 235, 211, 0.2) 36%,
    transparent 68%
  );
  filter: blur(12px);
}

.letter-motes {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.letter-mote {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 253, 246, 0.9), rgba(234, 209, 176, 0.12) 66%, transparent);
  box-shadow: 0 0 8px rgba(255, 249, 236, 0.4);
  animation: letter-mote-float var(--mote-duration) ease-in-out var(--mote-delay) infinite
    alternate;
  will-change: transform, opacity;
}

.letter-flora {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.55;
}

.flora-head {
  position: absolute;
  filter: blur(1.4px) saturate(0.84);
}

.flora-a {
  left: 3%;
  bottom: 5%;
  opacity: 0.58;
  transform: rotate(-12deg);
}

.flora-b {
  left: 12%;
  bottom: 13%;
  opacity: 0.44;
}

.flora-c {
  right: 4%;
  bottom: 7%;
  opacity: 0.52;
  transform: rotate(20deg);
}

.flora-stem {
  position: absolute;
  width: 2px;
  height: 26vh;
  background: linear-gradient(180deg, transparent, rgba(141, 156, 123, 0.38));
  transform-origin: bottom;
}

.stem-a {
  left: 10%;
  bottom: 0;
  transform: rotate(8deg);
}

.stem-b {
  right: 9%;
  bottom: 0;
  transform: rotate(-7deg);
}

.dandelion-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.dandelion-wrap {
  position: absolute;
  top: 2%;
  right: 3%;
  width: min(520px, 44vw);
  transform: translate3d(70vw, 6vh, 0) rotate(12deg) scale(0.9);
  transition: transform 3.4s cubic-bezier(0.18, 0.68, 0.25, 1);
  animation: dandelion-idle 7s ease-in-out 3.6s infinite alternate;
}

.dandelion-wrap.is-in {
  transform: translate3d(0, 0, 0) rotate(-2deg) scale(1);
}

.dandelion-wrap.is-dispersing {
  transform: translate3d(-2vw, -3vh, 0) rotate(-7deg) scale(1.08);
  transition: transform 2.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.dandelion-plant {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0;
  filter: blur(2px) drop-shadow(0 18px 40px rgba(137, 131, 107, 0.1));
  transition:
    opacity 2.1s ease,
    filter 2.4s ease;
}

.dandelion-wrap.is-in .dandelion-plant {
  opacity: 0.94;
  filter: blur(0) drop-shadow(0 18px 40px rgba(137, 131, 107, 0.1));
}

.dandelion-wrap.is-dispersing .dandelion-plant {
  opacity: 0;
  filter: blur(5px) drop-shadow(0 18px 40px rgba(137, 131, 107, 0.1));
  transition:
    opacity 1.6s ease,
    filter 2s ease;
}

.dandelion-fluff {
  animation: fluff-breathe 6s ease-in-out infinite alternate;
  transform-box: fill-box;
  transform-origin: center;
}

.seed-cloud {
  position: absolute;
  left: 59%;
  top: 51%;
  width: 1px;
  height: 1px;
}

.flying-seed {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--seed-size);
  height: calc(var(--seed-size) * 1.45);
  opacity: 0;
  animation: seed-scatter 4.8s cubic-bezier(0.16, 0.62, 0.32, 1) var(--seed-delay) forwards;
  filter: drop-shadow(0 0 6px rgba(255, 251, 239, 0.7));
}

.envelope-layer {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
}

.envelope-layer::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(620px, 70vw);
  height: min(500px, 56vh);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    ellipse,
    rgba(255, 250, 237, 0.5) 0%,
    rgba(237, 217, 187, 0.18) 42%,
    transparent 72%
  );
  filter: blur(14px);
  pointer-events: none;
}

.envelope-float {
  animation: envelope-float 6.5s ease-in-out infinite;
}

.envelope {
  position: relative;
  width: clamp(260px, 31vw, 370px);
  aspect-ratio: 1.55;
  border: none;
  background: transparent;
  perspective: 900px;
  cursor: pointer;
  filter: drop-shadow(0 30px 32px rgba(135, 108, 91, 0.2));
  transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.envelope:hover {
  transform: translateY(-5px) scale(1.012);
}

.envelope-shadow {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: -9%;
  height: 16%;
  border-radius: 50%;
  background: rgba(125, 100, 84, 0.18);
  filter: blur(17px);
}

.envelope-back {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background:
    linear-gradient(150deg, rgba(255, 252, 244, 0.96), rgba(243, 230, 211, 0.96)),
    #f4e6d3;
  border: 1px solid rgba(215, 194, 167, 0.68);
  box-shadow: inset 0 0 34px rgba(255, 255, 255, 0.36);
}

.envelope-flap {
  position: absolute;
  inset: 0;
  z-index: 4;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, rgba(250, 240, 225, 0.98), rgba(239, 224, 203, 0.96));
  clip-path: polygon(0 0, 100% 0, 50% 61%);
  transform-origin: 50% 0;
  transition:
    transform 0.72s cubic-bezier(0.6, 0.05, 0.25, 1),
    opacity 0.7s ease,
    z-index 0s;
  box-shadow: 0 2px 0 rgba(184, 155, 127, 0.08);
}

.envelope-front {
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: 8px;
  background:
    linear-gradient(145deg, rgba(255, 252, 245, 0.94), rgba(243, 231, 214, 0.94)),
    #f4e6d3;
  clip-path: polygon(0 100%, 0 26%, 50% 67%, 100% 26%, 100% 100%);
  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.4);
}

.envelope-front::before,
.envelope-front::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 58%;
  height: 76%;
  background: linear-gradient(135deg, transparent 49.4%, rgba(196, 170, 140, 0.16) 50%, transparent 50.6%);
  opacity: 0.8;
}

.envelope-front::before {
  left: 0;
  transform: skewX(18deg);
  transform-origin: bottom left;
}

.envelope-front::after {
  right: 0;
  transform: skewX(-18deg);
  transform-origin: bottom right;
}

.envelope-seal {
  position: absolute;
  left: 50%;
  top: 55%;
  z-index: 5;
  width: clamp(36px, 4vw, 48px);
  height: clamp(36px, 4vw, 48px);
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 244, 237, 0.5);
  border-radius: 50%;
  color: rgba(255, 249, 241, 0.9);
  background:
    radial-gradient(circle at 34% 25%, rgba(255, 230, 225, 0.62), transparent 34%),
    linear-gradient(145deg, #d9a8b1, #bd7f8c);
  box-shadow:
    0 5px 13px rgba(146, 92, 101, 0.25),
    inset 0 0 9px rgba(255, 255, 255, 0.24);
  font-size: 15px;
  transform: translate(-50%, -50%);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.envelope.opening .envelope-flap {
  transform: rotateX(180deg);
  z-index: 1;
}

.envelope.opening .envelope-seal {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.6);
}

.envelope.opening {
  transform: translateY(-22px) scale(1.03);
}

.envelope-hint {
  margin: 0;
  color: rgba(106, 86, 78, 0.55);
  font-size: clamp(11px, 1.1vw, 13px);
  letter-spacing: 0.12em;
  animation: hint-breathe 3s ease-in-out infinite;
}

.letter-paper {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 14;
  width: min(720px, 88vw);
  min-height: min(470px, 55vh);
  padding: clamp(34px, 5vw, 64px) clamp(30px, 5.4vw, 70px);
  transform: translate(-50%, -50%);
  background:
    radial-gradient(ellipse 52% 48% at 19% 18%, rgba(255, 252, 240, 0.72), transparent 70%),
    radial-gradient(ellipse 35% 30% at 88% 18%, rgba(211, 174, 128, 0.2), transparent 75%),
    radial-gradient(ellipse 46% 36% at 82% 88%, rgba(205, 167, 122, 0.22), transparent 74%),
    linear-gradient(135deg, #f8edda 0%, #f1e0c1 48%, #e9d4b1 100%);
  border: 1px solid rgba(183, 150, 112, 0.46);
  border-radius: 3px;
  box-shadow:
    0 44px 90px rgba(112, 89, 69, 0.22),
    0 9px 24px rgba(112, 89, 69, 0.1),
    inset 0 0 55px rgba(255, 250, 235, 0.44),
    inset 0 0 0 10px rgba(255, 250, 235, 0.08);
  transform-origin: 50% 0;
  animation: paper-unfurl 1.25s cubic-bezier(0.2, 0.7, 0.25, 1) both;
}

.letter-paper::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0.3;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.62' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  mix-blend-mode: multiply;
}

.letter-paper::after {
  content: '';
  position: absolute;
  inset: 15px;
  border: 1px solid rgba(165, 129, 91, 0.13);
  border-radius: 1px;
  pointer-events: none;
}

.letter-arrival {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background:
    radial-gradient(ellipse 58% 48% at 50% 38%, rgba(255, 244, 219, 0.7), transparent 72%),
    radial-gradient(ellipse 38% 52% at 78% 78%, rgba(214, 158, 168, 0.18), transparent 76%);
  opacity: 0;
  pointer-events: none;
  animation: letter-arrival-glow 2.4s ease 0.12s both;
}

.paper-vine {
  position: absolute;
  bottom: -8px;
  z-index: 0;
  width: 118px;
  height: 248px;
  opacity: 0.72;
  pointer-events: none;
  animation: vine-in 1.9s ease 0.4s both;
}

.paper-vine-left {
  left: -9px;
}

.paper-vine-right {
  right: -9px;
  transform: scaleX(-1);
}

.envelope-flourish {
  position: absolute;
  inset: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.86;
}

.paper-stain {
  position: absolute;
  border-radius: 50%;
  filter: blur(22px);
  pointer-events: none;
}

.stain-a {
  width: 35%;
  height: 42%;
  left: -5%;
  bottom: -12%;
  background: rgba(192, 147, 98, 0.25);
}

.stain-b {
  width: 28%;
  height: 32%;
  right: 5%;
  top: -8%;
  background: rgba(218, 180, 129, 0.25);
}

.paper-fold {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20%;
  pointer-events: none;
  opacity: 0.25;
  background: linear-gradient(90deg, transparent, rgba(171, 133, 93, 0.14), transparent);
}

.fold-left {
  left: 16%;
  transform: skewX(-3deg);
}

.fold-right {
  right: 15%;
  transform: skewX(4deg);
}

.paper-corner {
  position: absolute;
  width: 26px;
  height: 26px;
  border-color: rgba(164, 128, 92, 0.22);
  pointer-events: none;
}

.corner-top {
  top: 18px;
  left: 18px;
  border-top: 1px solid;
  border-left: 1px solid;
}

.corner-bottom {
  right: 18px;
  bottom: 18px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.letter-content {
  position: relative;
  z-index: 1;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.letter-text {
  margin: 0;
  color: #5c4b3d;
  white-space: pre-line;
  font-family: var(--font-body);
  font-size: clamp(16px, 1.75vw, 22px);
  letter-spacing: 0.07em;
  line-height: 1.95;
  text-shadow: 0 1px 0 rgba(255, 251, 237, 0.46);
}

.letter-caret {
  display: inline-block;
  margin-left: 2px;
  color: rgba(127, 102, 77, 0.45);
  font-weight: 300;
  animation: caret 0.9s steps(2, end) infinite;
}

.letter-sign {
  display: block;
  margin-top: 22px;
  color: rgba(196, 139, 149, 0.66);
  font-size: 18px;
  text-shadow: 0 0 16px rgba(220, 175, 181, 0.3);
}

.celebrate-button {
  position: relative;
  z-index: 20;
  width: clamp(70px, 8.2vw, 88px);
  height: clamp(70px, 8.2vw, 88px);
  margin-top: 13px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 249, 241, 0.7);
  border-radius: 50%;
  color: rgba(255, 250, 243, 0.94);
  background:
    radial-gradient(circle at 33% 24%, rgba(255, 255, 255, 0.34), transparent 36%),
    linear-gradient(145deg, #d091a1, #b66f84);
  box-shadow:
    0 14px 32px rgba(151, 92, 106, 0.3),
    0 0 0 7px rgba(224, 170, 183, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.16);
  font-size: clamp(13px, 1.3vw, 15px);
  letter-spacing: 0.16em;
  animation: celebrate-float 4.4s ease-in-out infinite;
  transition:
    transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 0.35s ease,
    background 0.35s ease;
}

.celebrate-button:hover {
  transform: translateY(-3px) scale(1.035);
  background:
    radial-gradient(circle at 33% 24%, rgba(255, 255, 255, 0.42), transparent 36%),
    linear-gradient(145deg, #e0adb8, #c88d9e);
  box-shadow:
    0 16px 34px rgba(151, 92, 106, 0.3),
    0 0 0 8px rgba(224, 170, 183, 0.15),
    inset 0 0 22px rgba(255, 255, 255, 0.17);
}

.celebrate-label {
  position: relative;
  z-index: 1;
  transform: translateX(0.08em);
}

.celebrate-spark {
  position: absolute;
  color: rgba(255, 249, 239, 0.86);
  font-size: 8px;
  text-shadow: 0 0 10px rgba(255, 248, 237, 0.8);
  animation: celebrate-spark 3.6s ease-in-out infinite;
}

.sparkle-top {
  top: 9px;
  right: 12px;
}

.sparkle-bottom {
  left: 11px;
  bottom: 10px;
  font-size: 6px;
  animation-delay: -1.3s;
}

.celebrate-button-enter-active {
  transition:
    opacity 1.1s ease,
    transform 1.1s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.celebrate-button-enter-from {
  opacity: 0;
  transform: scale(0.65) translateY(8px);
}

@keyframes celebrate-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes celebrate-spark {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.75);
  }
  50% {
    opacity: 0.95;
    transform: scale(1.15);
  }
}

.hearts-field {
  position: absolute;
  inset: 0;
  z-index: 12;
  overflow: hidden;
  pointer-events: none;
}

.ending-heart {
  position: absolute;
  display: block;
  color: var(--heart-color);
  font-size: var(--heart-size);
  line-height: 1;
  opacity: 0;
  transform: translate3d(0, 0, 0) scale(0.35) rotate(var(--heart-rotate));
  filter: drop-shadow(0 5px 9px rgba(157, 113, 120, 0.08));
  animation: heart-arrive var(--heart-duration) cubic-bezier(0.18, 0.72, 0.3, 1)
    var(--heart-delay) both;
  will-change: transform, opacity;
}

.end-wash {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  background:
    radial-gradient(ellipse 65% 55% at 50% 42%, rgba(255, 248, 237, 0.42), transparent 72%),
    linear-gradient(180deg, transparent 48%, rgba(235, 211, 192, 0.16));
  transition: opacity 2.8s ease;
}

.end-wash.visible {
  opacity: 1;
}

.ending-footer {
  position: absolute;
  left: 50%;
  bottom: calc(28px + env(safe-area-inset-bottom));
  z-index: 18;
  margin: 0;
  transform: translateX(-50%);
  color: rgba(92, 74, 68, 0.44);
  font-size: clamp(10px, 1vw, 12px);
  letter-spacing: 0.12em;
  white-space: nowrap;
  text-shadow: 0 1px 0 rgba(255, 251, 240, 0.4);
}

.envelope-appear-enter-active {
  transition:
    opacity 1.8s ease,
    transform 1.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.envelope-appear-enter-from {
  opacity: 0;
  transform: translateY(16vh) scale(0.92);
}

.paper-rise-enter-active {
  transition:
    opacity 1.2s ease,
    transform 1.2s cubic-bezier(0.18, 0.7, 0.28, 1);
}

.paper-rise-enter-from {
  opacity: 0;
  transform: translate(-50%, -42%) scaleY(0.07) rotateX(13deg);
}

.letter-sign-enter-active {
  transition:
    opacity 1.4s ease,
    transform 1.4s ease;
}

.letter-sign-enter-from {
  opacity: 0;
  transform: translateY(7px);
}

.date-echo-enter-active {
  transition: opacity 2.2s ease;
}

.date-echo-leave-active {
  transition: opacity 2s ease;
}

.date-echo-enter-from,
.date-echo-leave-to {
  opacity: 0;
}

.ending-footer-enter-active {
  transition: opacity 2.6s ease;
}

.ending-footer-enter-from {
  opacity: 0;
}

@keyframes letter-scene-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes letter-mote-float {
  0% {
    opacity: 0.08;
    transform: translate3d(0, 0, 0) scale(0.8);
  }
  50% {
    opacity: 0.55;
  }
  100% {
    opacity: 0.24;
    transform: translate3d(var(--mote-drift), -28px, 0) scale(1.15);
  }
}

@keyframes wash-float {
  from {
    transform: translate3d(0, 0, 0) scale(0.95) rotate(-2deg);
  }
  to {
    transform: translate3d(2vw, -2vh, 0) scale(1.06) rotate(2deg);
  }
}

@keyframes dandelion-idle {
  from {
    margin-top: -4px;
    margin-right: 2px;
  }
  to {
    margin-top: 7px;
    margin-right: -5px;
  }
}

@keyframes fluff-breathe {
  from {
    transform: scale(0.97) rotate(-1.5deg);
    opacity: 0.82;
  }
  to {
    transform: scale(1.04) rotate(1.5deg);
    opacity: 1;
  }
}

@keyframes seed-scatter {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(var(--seed-rotate)) scale(0.45);
  }
  16% {
    opacity: 0.78;
  }
  72% {
    opacity: 0.46;
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--dx), var(--dy), 0)
      rotate(calc(var(--seed-rotate) + 100deg)) scale(1.06);
  }
}

@keyframes envelope-float {
  0%,
  100% {
    transform: translateY(0) rotate(-1.1deg);
  }
  50% {
    transform: translateY(-10px) rotate(1.2deg);
  }
}

@keyframes hint-breathe {
  0%,
  100% {
    opacity: 0.38;
  }
  50% {
    opacity: 0.72;
  }
}

@keyframes letter-arrival-glow {
  0% {
    opacity: 0;
    filter: blur(10px);
  }
  32% {
    opacity: 1;
  }
  100% {
    opacity: 0.28;
    filter: blur(2px);
  }
}

@keyframes vine-in {
  from {
    opacity: 0;
    translate: 0 14px;
  }
  to {
    opacity: 0.72;
    translate: 0 0;
  }
}

@keyframes paper-unfurl {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scaleY(0.06) rotateX(15deg);
  }
  32% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scaleY(1) rotateX(0);
  }
}

@keyframes caret {
  0%,
  100% {
    opacity: 0.16;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes heart-arrive {
  0% {
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(0.35) rotate(var(--heart-rotate));
  }
  30% {
    opacity: var(--heart-opacity);
  }
  100% {
    opacity: var(--heart-opacity);
    transform: translate3d(var(--heart-x), var(--heart-y), 0) scale(1)
      rotate(calc(var(--heart-rotate) + 10deg));
  }
}

@media (max-width: 760px) {
  .dandelion-wrap {
    top: 3%;
    right: -13%;
    width: min(440px, 76vw);
  }

  .dandelion-wrap.is-in .dandelion-plant {
    opacity: 0.82;
  }

  .envelope {
    width: min(300px, 76vw);
  }

  .envelope-layer {
    gap: 22px;
  }

  .letter-paper {
    width: 91vw;
    min-height: 48vh;
    padding: 36px 24px;
  }

  .letter-text {
    font-size: clamp(14px, 3.9vw, 18px);
    line-height: 1.9;
  }

  .ending-footer {
    width: 92vw;
    text-align: center;
    white-space: normal;
    line-height: 1.8;
  }
}

@media (max-height: 640px) {
  .letter-paper {
    min-height: 0;
    padding-top: 30px;
    padding-bottom: 30px;
  }

  .letter-content {
    min-height: 160px;
  }
}

@media (max-width: 700px) {
  .letter-back {
    left: 12px;
    top: calc(13px + env(safe-area-inset-top));
    height: 32px;
    padding: 0 10px;
    font-size: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dandelion-wrap,
  .seed-cloud,
  .ending-heart,
  .wash {
    animation-duration: 12s;
  }
}
</style>
