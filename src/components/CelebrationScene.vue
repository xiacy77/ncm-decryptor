<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import PhotoCaptureModal from '@/components/PhotoCaptureModal.vue'
import { CELEBRATION, UI, assetUrl } from '@/config/story'
import { downloadCelebrationCard } from '@/utils/downloadCelebrationCard'

const emit = defineEmits(['close'])

const leftPhoto = ref(CELEBRATION.leftPhoto ? assetUrl(CELEBRATION.leftPhoto) : '')
const rightPhoto = ref(CELEBRATION.rightPhoto ? assetUrl(CELEBRATION.rightPhoto) : '')
const pickerSide = ref(null)
const saving = ref(false)
const statusMessage = ref('')
const statusError = ref(false)
const closeButton = ref(null)
const now = ref(new Date())

let previousFocus = null
let clockTimer = null
let statusTimer = null

const pad = (value) => String(value).padStart(2, '0')

const dateLabel = computed(() => {
  const date = now.value
  return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日`
})

const stamp = computed(() => {
  const date = now.value
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
})

const canSave = computed(() => Boolean(leftPhoto.value && rightPhoto.value))

const hearts = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: 4 + ((index * 53) % 92),
  top: 4 + ((index * 37) % 88),
  size: 8 + (index % 4) * 5,
  delay: -((index * 1.3) % 8),
  duration: 7 + (index % 5) * 1.6,
  opacity: 0.12 + (index % 4) * 0.06,
}))

function openPicker(side) {
  pickerSide.value = side
}

function savePhoto(dataUrl) {
  if (pickerSide.value === 'left') leftPhoto.value = dataUrl
  if (pickerSide.value === 'right') rightPhoto.value = dataUrl
  pickerSide.value = null
}

function clearStatusAfter(delay = 3200) {
  if (statusTimer) clearTimeout(statusTimer)
  statusTimer = setTimeout(() => {
    statusMessage.value = ''
    statusError.value = false
    statusTimer = null
  }, delay)
}

async function saveCard() {
  if (!canSave.value || saving.value) return
  saving.value = true
  statusMessage.value = ''
  statusError.value = false
  try {
    await downloadCelebrationCard({
      leftPhoto: leftPhoto.value,
      rightPhoto: rightPhoto.value,
      dateLabel: dateLabel.value,
      stamp: stamp.value,
    })
    statusMessage.value = UI.celebration.downloaded
    clearStatusAfter()
  } catch (error) {
    statusError.value = true
    statusMessage.value = error?.message || UI.photo.fileError
    clearStatusAfter(4200)
  } finally {
    saving.value = false
  }
}

function close() {
  emit('close')
}

function handleKeydown(event) {
  if (event.key !== 'Escape' || pickerSide.value) return
  event.preventDefault()
  close()
}

onMounted(async () => {
  previousFocus = document.activeElement
  window.addEventListener('keydown', handleKeydown)
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 30000)
  await nextTick()
  closeButton.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (clockTimer) clearInterval(clockTimer)
  if (statusTimer) clearTimeout(statusTimer)
  if (previousFocus instanceof HTMLElement) previousFocus.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="celebration-overlay" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
      <span class="celebration-blob blob-pink" aria-hidden="true"></span>
      <span class="celebration-blob blob-blue" aria-hidden="true"></span>
      <span class="celebration-blob blob-cream" aria-hidden="true"></span>

      <div class="celebration-hearts" aria-hidden="true">
        <span
          v-for="heart in hearts"
          :key="heart.id"
          :style="{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.size}px`,
            opacity: heart.opacity,
            '--heart-delay': `${heart.delay}s`,
            '--heart-duration': `${heart.duration}s`,
          }"
        >♥</span>
      </div>

      <button
        ref="closeButton"
        type="button"
        class="celebration-close"
        :aria-label="UI.celebration.close"
        @click="close"
      >
        <span aria-hidden="true">×</span>
        <span class="close-word">{{ UI.celebration.close }}</span>
      </button>

      <header class="celebration-header">
        <p class="celebration-kicker">{{ CELEBRATION.kicker }}</p>
        <h2 id="celebration-title" class="celebration-title">{{ CELEBRATION.title }}</h2>
        <p class="celebration-english">{{ CELEBRATION.english }}</p>
      </header>

      <div class="photo-stage">
        <button
          type="button"
          class="photo-slot photo-left"
          :class="{ 'has-photo': leftPhoto }"
          :aria-label="leftPhoto ? UI.celebration.changePhoto : UI.celebration.leftAria"
          @click="openPicker('left')"
        >
          <img v-if="leftPhoto" :src="leftPhoto" alt="" />
          <span v-else class="empty-photo">
            <span class="empty-icon" aria-hidden="true">＋</span>
            <span class="empty-text">{{ UI.celebration.leftEmpty }}</span>
            <span class="empty-sub">{{ UI.photo.emptySub }}</span>
          </span>
          <span class="photo-tape" aria-hidden="true"></span>
          <span class="photo-owner">{{ UI.celebration.leftLabel }}</span>
          <span v-if="leftPhoto" class="photo-change">{{ UI.celebration.changePhoto }}</span>
        </button>

        <div class="center-heart" aria-hidden="true">
          <span class="heart-glow"></span>
          <svg viewBox="0 0 100 92" class="heart-svg">
            <defs>
              <linearGradient id="celebration-heart-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#f4cbd3" />
                <stop offset="0.55" stop-color="#e3a4b4" />
                <stop offset="1" stop-color="#d58d9f" />
              </linearGradient>
            </defs>
            <path
              d="M50 86C18 63 0 44 0 24 0 9 11 0 24 0c10 0 19 6 26 16C57 6 66 0 76 0c13 0 24 9 24 24 0 20-18 39-50 62Z"
              fill="url(#celebration-heart-gradient)"
            />
            <path
              d="M25 25c4-8 12-11 18-6"
              fill="none"
              stroke="rgba(255, 249, 242, 0.55)"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
          <span class="heart-year">1</span>
        </div>

        <button
          type="button"
          class="photo-slot photo-right"
          :class="{ 'has-photo': rightPhoto }"
          :aria-label="rightPhoto ? UI.celebration.changePhoto : UI.celebration.rightAria"
          @click="openPicker('right')"
        >
          <img v-if="rightPhoto" :src="rightPhoto" alt="" />
          <span v-else class="empty-photo">
            <span class="empty-icon" aria-hidden="true">＋</span>
            <span class="empty-text">{{ UI.celebration.rightEmpty }}</span>
            <span class="empty-sub">{{ UI.photo.emptySub }}</span>
          </span>
          <span class="photo-tape" aria-hidden="true"></span>
          <span class="photo-owner">{{ UI.celebration.rightLabel }}</span>
          <span v-if="rightPhoto" class="photo-change">{{ UI.celebration.changePhoto }}</span>
        </button>
      </div>

      <p class="celebration-subtitle">{{ CELEBRATION.subtitle }}</p>

      <div class="celebration-actions">
        <button
          type="button"
          class="save-card-button"
          :disabled="!canSave || saving"
          @click="saveCard"
        >
          <span class="save-spark" aria-hidden="true">✦</span>
          {{ saving ? UI.celebration.saving : UI.celebration.save }}
        </button>
        <p v-if="!canSave" class="save-hint">{{ UI.celebration.saveHint }}</p>
        <p v-else class="save-hint">{{ UI.celebration.photoReady }}</p>
      </div>

      <Transition name="status">
        <p v-if="statusMessage" class="card-status" :class="{ error: statusError }">
          {{ statusMessage }}
        </p>
      </Transition>

      <footer class="celebration-footer">
        <span class="footer-sign">{{ CELEBRATION.footerSign }}</span>
        <span class="system-date">
          <span class="date-prefix">{{ UI.celebration.datePrefix }}</span>
          {{ dateLabel }}
        </span>
      </footer>

      <PhotoCaptureModal
        v-if="pickerSide"
        @save="savePhoto"
        @close="pickerSide = null"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.celebration-overlay {
  position: fixed;
  inset: 0;
  z-index: 280;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(14px, 2.6vh, 28px);
  overflow: auto;
  padding: clamp(24px, 4vh, 44px) clamp(18px, 4vw, 50px);
  background:
    radial-gradient(ellipse 60% 52% at 50% 35%, rgba(255, 255, 255, 0.88), transparent 70%),
    radial-gradient(ellipse 72% 58% at 50% 100%, rgba(250, 221, 225, 0.55), transparent 74%),
    linear-gradient(140deg, #fff9f4 0%, #fdeef0 44%, #f7e9e9 72%, #fdf8f1 100%);
  color: #654e56;
  animation: celebration-in 0.9s cubic-bezier(0.2, 0.76, 0.25, 1) both;
  isolation: isolate;
}

.celebration-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.28;
  background-image:
    radial-gradient(circle at 18% 30%, rgba(167, 123, 114, 0.12) 0 1px, transparent 1.4px),
    radial-gradient(circle at 72% 66%, rgba(157, 118, 122, 0.1) 0 1px, transparent 1.3px);
  background-size: 17px 17px, 23px 23px;
  mix-blend-mode: multiply;
}

.celebration-blob {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(46px);
  opacity: 0.58;
  pointer-events: none;
}

.blob-pink {
  width: 42vw;
  height: 32vw;
  left: -14vw;
  top: 4vh;
  background: rgba(238, 188, 199, 0.4);
}

.blob-blue {
  width: 44vw;
  height: 34vw;
  right: -14vw;
  top: 20vh;
  background: rgba(199, 200, 227, 0.35);
}

.blob-cream {
  width: 52vw;
  height: 34vw;
  left: 20vw;
  bottom: -16vh;
  background: rgba(244, 217, 187, 0.35);
}

.celebration-hearts {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.celebration-hearts span {
  position: absolute;
  color: #deabb8;
  animation: celebration-heart-float var(--heart-duration) ease-in-out var(--heart-delay) infinite
    alternate;
  filter: blur(0.2px);
}

.celebration-close {
  position: absolute;
  top: calc(18px + env(safe-area-inset-top));
  right: max(18px, env(safe-area-inset-right));
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 13px;
  border: 1px solid rgba(155, 111, 118, 0.14);
  border-radius: 999px;
  color: rgba(111, 82, 88, 0.6);
  background: rgba(255, 250, 244, 0.5);
  font-size: 9px;
  letter-spacing: 0.06em;
  backdrop-filter: blur(10px);
  transition:
    color 0.3s ease,
    background 0.3s ease;
}

.celebration-close span:first-child {
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
}

.celebration-close:hover {
  color: #6b4d55;
  background: rgba(255, 251, 245, 0.8);
}

.celebration-header {
  position: relative;
  z-index: 2;
  text-align: center;
}

.celebration-kicker {
  margin: 0 0 8px;
  color: rgba(165, 116, 130, 0.66);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(8px, 0.9vw, 10px);
  letter-spacing: 0.3em;
}

.celebration-title {
  margin: 0;
  color: #654b55;
  font-family: var(--font-display);
  font-size: clamp(27px, 4.1vw, 50px);
  font-weight: 400;
  letter-spacing: 0.12em;
  line-height: 1.4;
  text-shadow: 0 0 25px rgba(255, 255, 255, 0.46);
}

.celebration-english {
  margin: 6px 0 0;
  color: rgba(126, 91, 97, 0.54);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(10px, 1.1vw, 13px);
  font-style: italic;
  letter-spacing: 0.055em;
}

.photo-stage {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(38px, 8vw, 112px);
}

.photo-slot {
  position: relative;
  width: clamp(180px, 17vw, 244px);
  height: auto;
  aspect-ratio: 9 / 16;
  padding: 8px;
  border: 1px solid rgba(255, 251, 244, 0.84);
  border-radius: 20px;
  background: linear-gradient(145deg, #fffaf3, #f5e6dd);
  box-shadow:
    0 28px 50px rgba(131, 83, 94, 0.19),
    0 5px 12px rgba(131, 83, 94, 0.08);
  transform: rotate(-2.7deg);
  cursor: pointer;
  overflow: visible;
  transition:
    transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 0.5s ease;
}

.photo-slot:hover {
  transform: rotate(0deg) translateY(-6px);
  box-shadow:
    0 34px 58px rgba(131, 83, 94, 0.23),
    0 5px 12px rgba(131, 83, 94, 0.08);
}

.photo-right {
  transform: rotate(2.7deg);
}

.photo-right:hover {
  transform: rotate(0deg) translateY(-6px);
}

.photo-slot img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 13px;
  user-select: none;
}

.empty-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  min-height: 100%;
  border: 1px dashed rgba(178, 134, 143, 0.3);
  border-radius: 13px;
  background:
    radial-gradient(ellipse 65% 50% at 50% 40%, rgba(255, 255, 255, 0.52), transparent 72%),
    linear-gradient(145deg, rgba(249, 229, 232, 0.45), rgba(248, 238, 227, 0.5));
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 33px;
  height: 33px;
  border: 1px solid rgba(174, 127, 137, 0.28);
  border-radius: 50%;
  color: rgba(158, 110, 122, 0.68);
  font-size: 21px;
  font-weight: 300;
  line-height: 1;
}

.empty-text {
  color: rgba(128, 91, 100, 0.58);
  font-size: 10px;
  letter-spacing: 0.06em;
}

.empty-sub {
  color: rgba(150, 114, 119, 0.34);
  font-family: 'Georgia', serif;
  font-size: 7px;
  letter-spacing: 0.14em;
}

.photo-tape {
  position: absolute;
  left: 50%;
  top: -10px;
  width: 55px;
  height: 18px;
  transform: translateX(-50%) rotate(-2deg);
  background: rgba(238, 215, 181, 0.58);
  box-shadow: 0 2px 5px rgba(131, 100, 78, 0.07);
  opacity: 0.8;
  z-index: 2;
}

.photo-owner {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(255, 250, 242, 0.44);
  border-radius: 50%;
  color: rgba(255, 249, 241, 0.9);
  background: rgba(118, 84, 91, 0.3);
  font-size: 10px;
  backdrop-filter: blur(6px);
}

.photo-slot:not(.has-photo) .photo-owner {
  color: rgba(122, 87, 94, 0.56);
  border-color: rgba(151, 110, 119, 0.18);
  background: rgba(255, 250, 242, 0.4);
}

.photo-change {
  position: absolute;
  left: 50%;
  bottom: 16px;
  z-index: 2;
  transform: translateX(-50%);
  padding: 4px 8px;
  border-radius: 999px;
  color: rgba(255, 250, 242, 0.78);
  background: rgba(86, 60, 68, 0.26);
  font-size: 7px;
  letter-spacing: 0.05em;
  opacity: 0;
  transition: opacity 0.35s ease;
  white-space: nowrap;
  backdrop-filter: blur(6px);
}

.photo-slot:hover .photo-change {
  opacity: 1;
}

.center-heart {
  position: absolute;
  left: 50%;
  top: 51%;
  z-index: 4;
  width: clamp(72px, 9vmin, 118px);
  height: clamp(72px, 9vmin, 118px);
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 14px 22px rgba(170, 102, 119, 0.22));
  animation: heart-beat 3.8s ease-in-out infinite;
}

.heart-glow {
  position: absolute;
  inset: -44%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 235, 235, 0.72) 0%,
    rgba(235, 174, 188, 0.2) 42%,
    transparent 72%
  );
  filter: blur(7px);
}

.heart-svg {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.heart-year {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  transform: translate(-50%, -48%);
  color: rgba(255, 250, 244, 0.9);
  font-family: 'Georgia', serif;
  font-size: clamp(17px, 2.4vmin, 28px);
  font-style: italic;
}

.celebration-subtitle {
  position: relative;
  z-index: 2;
  margin: -2px 0 0;
  color: rgba(119, 87, 94, 0.55);
  font-size: clamp(10px, 1.1vw, 12px);
  letter-spacing: 0.08em;
  text-align: center;
}

.celebration-actions {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-top: -2px;
}

.save-card-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 27px;
  border: 1px solid rgba(255, 250, 244, 0.48);
  border-radius: 999px;
  color: rgba(255, 251, 245, 0.94);
  background: linear-gradient(145deg, #ce9aa8, #bb8190);
  box-shadow:
    0 12px 26px rgba(153, 98, 111, 0.2),
    inset 0 0 18px rgba(255, 255, 255, 0.12);
  font-size: 11px;
  letter-spacing: 0.09em;
  transition:
    transform 0.35s ease,
    opacity 0.35s ease,
    box-shadow 0.35s ease;
}

.save-card-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 16px 32px rgba(153, 98, 111, 0.26),
    inset 0 0 18px rgba(255, 255, 255, 0.16);
}

.save-card-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
  filter: saturate(0.72);
}

.save-spark {
  font-size: 11px;
}

.save-hint {
  margin: 0;
  color: rgba(132, 102, 106, 0.48);
  font-size: 8px;
  letter-spacing: 0.04em;
}

.card-status {
  position: fixed;
  left: 50%;
  bottom: calc(24px + env(safe-area-inset-bottom));
  z-index: 6;
  margin: 0;
  transform: translateX(-50%);
  padding: 9px 16px;
  border: 1px solid rgba(255, 250, 241, 0.6);
  border-radius: 999px;
  color: rgba(92, 74, 76, 0.8);
  background: rgba(255, 249, 240, 0.82);
  box-shadow: 0 12px 28px rgba(122, 89, 94, 0.16);
  font-size: 9px;
  letter-spacing: 0.04em;
  backdrop-filter: blur(9px);
  white-space: nowrap;
}

.card-status.error {
  color: #955b66;
  background: rgba(255, 238, 238, 0.9);
}

.celebration-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: min(920px, 92vw);
  padding-top: 2px;
}

.footer-sign {
  color: rgba(150, 113, 112, 0.28);
  font-family: 'Georgia', serif;
  font-size: 7px;
  letter-spacing: 0.18em;
}

.system-date {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(115, 84, 86, 0.56);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(9px, 1vw, 11px);
  letter-spacing: 0.08em;
}

.date-prefix {
  color: rgba(150, 112, 111, 0.34);
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 0.06em;
}

.status-enter-active,
.status-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.status-enter-from,
.status-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px);
}

@keyframes celebration-in {
  from {
    opacity: 0;
    transform: scale(1.02);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

@keyframes celebration-heart-float {
  from {
    opacity: 0.08;
    transform: translate3d(0, 8px, 0) rotate(-9deg) scale(0.85);
  }
  to {
    opacity: 0.28;
    transform: translate3d(8px, -18px, 0) rotate(9deg) scale(1.1);
  }
}

@keyframes heart-beat {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  42% {
    transform: translate(-50%, -50%) scale(1.06);
  }
  56% {
    transform: translate(-50%, -50%) scale(0.98);
  }
}

@media (max-width: 760px) {
  .celebration-overlay {
    gap: 12px;
    justify-content: center;
    padding: calc(58px + env(safe-area-inset-top)) 14px calc(24px + env(safe-area-inset-bottom));
  }

  .celebration-close {
    top: calc(14px + env(safe-area-inset-top));
    right: 14px;
  }

  .celebration-header {
    margin-top: 0;
  }

  .photo-stage {
    gap: 18px;
    margin-top: 4px;
  }

  .photo-slot {
    width: min(37vw, 178px);
    height: auto;
    padding: 6px;
    border-radius: 16px;
  }

  .photo-slot img {
    border-radius: 10px;
  }

  .empty-photo {
    border-radius: 10px;
  }

  .empty-icon {
    width: 27px;
    height: 27px;
    font-size: 17px;
  }

  .empty-text {
    font-size: 8px;
  }

  .empty-sub {
    font-size: 6px;
  }

  .center-heart {
    width: 62px;
    height: 62px;
  }

  .photo-owner {
    left: 10px;
    bottom: 10px;
    width: 22px;
    height: 22px;
    font-size: 8px;
  }

  .photo-change {
    display: none;
  }

  .celebration-subtitle {
    margin-top: 8px;
  }

  .celebration-footer {
    width: 92vw;
    margin-top: 2px;
  }

  .footer-sign {
    display: none;
  }

  .system-date {
    margin-left: auto;
  }

  .card-status {
    bottom: calc(66px + env(safe-area-inset-bottom));
    font-size: 8px;
  }
}

@media (max-width: 760px) and (max-height: 700px) {
  .celebration-overlay {
    justify-content: flex-start;
  }

  .photo-slot {
    width: min(33vw, 154px);
  }
}

@media (max-height: 680px) and (min-width: 761px) {
  .photo-slot {
    width: clamp(170px, 15vw, 210px);
  }

  .celebration-title {
    font-size: clamp(25px, 3.4vw, 38px);
  }
}
</style>
