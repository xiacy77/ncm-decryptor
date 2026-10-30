<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import AlbumModal from '@/components/AlbumModal.vue'
import CameraHint from '@/components/CameraHint.vue'
import CelebrationScene from '@/components/CelebrationScene.vue'
import DiaryModal from '@/components/DiaryModal.vue'
import FireworkScene from '@/components/FireworkScene.vue'
import FlowerSeaScene from '@/components/FlowerSeaScene.vue'
import GestureGuide from '@/components/GestureGuide.vue'
import GestureStatus from '@/components/GestureStatus.vue'
import HandCursor from '@/components/HandCursor.vue'
import LetterScene from '@/components/LetterScene.vue'
import PlayZone from '@/components/PlayZone.vue'
import SoundToggle from '@/components/SoundToggle.vue'
import StarfieldScene from '@/components/StarfieldScene.vue'
import StarlightTransition from '@/components/StarlightTransition.vue'
import TogetherTimer from '@/components/TogetherTimer.vue'
import { useAudioManager } from '@/composables/useAudioManager'
import { useHandGestures } from '@/composables/useHandGestures'
import { BGM_SCENES, FLOWER_DEFAULT_MODE, PALETTE, TIMING, UI } from '@/config/story'
import { AUDIO_KEY, GESTURE_KEY } from '@/keys'

const gesture = useHandGestures()
const audio = useAudioManager()

provide(GESTURE_KEY, gesture)
provide(AUDIO_KEY, audio)

const act = ref('stars')
const manualFallback = ref(false)
const guideOpen = ref(false)
const albumOpen = ref(false)
const celebrationOpen = ref(false)
const fireworksOpen = ref(false)
const diaryOpen = ref(false)
const playOpen = ref(false)
const letterVisible = ref(false)
const letterClosing = ref(false)
const zooming = ref(false)
const cameraHintDismissed = ref(false)
const showTransition = ref(false)
const transitionPhase = ref('in')
const flowerMode = ref(FLOWER_DEFAULT_MODE)
const celebrationBloom = ref(false)

const timers = new Set()

const later = (callback, delay) => {
  const timer = setTimeout(() => {
    timers.delete(timer)
    callback()
  }, delay)
  timers.add(timer)
  return timer
}

const terminalCameraStates = ['denied', 'no-camera', 'unsupported', 'busy', 'error']
const manualMode = computed(
  () => manualFallback.value || terminalCameraStates.includes(gesture.status.value),
)

const themeClass = computed(() => (act.value === 'stars' ? 'theme-dark' : 'theme-light'))
const showCameraHint = computed(
  () => act.value === 'stars' && !cameraHintDismissed.value && !letterVisible.value,
)
const overlayOpen = computed(
  () =>
    albumOpen.value ||
    celebrationOpen.value ||
    fireworksOpen.value ||
    diaryOpen.value ||
    playOpen.value,
)
const showTogetherTimer = computed(
  () =>
    act.value === 'bloom' &&
    !showTransition.value &&
    !letterVisible.value &&
    !letterClosing.value &&
    !overlayOpen.value &&
    !zooming.value,
)

const showHandCursor = computed(
  () =>
    act.value === 'stars' &&
    gesture.status.value === 'ready' &&
    !manualFallback.value &&
    !letterVisible.value &&
    !letterClosing.value &&
    !overlayOpen.value &&
    !showTransition.value &&
    !zooming.value,
)

const themeStyle = computed(() => ({
  '--night': PALETTE.night,
  '--night-deep': PALETTE.nightDeep,
  '--night-soft': PALETTE.nightSoft,
  '--cream': PALETTE.cream,
  '--cream-soft': PALETTE.creamSoft,
  '--paper': PALETTE.paper,
  '--paper-deep': PALETTE.paperDeep,
  '--blush': PALETTE.blush,
  '--rose': PALETTE.rose,
  '--lavender': PALETTE.lavender,
  '--sky': PALETTE.sky,
  '--sage': PALETTE.sage,
  '--sage-deep': PALETTE.sageDeep,
  '--gold': PALETTE.gold,
  '--gold-deep': PALETTE.goldDeep,
  '--ink': PALETTE.ink,
  '--ink-soft': PALETTE.inkSoft,
  '--white': PALETTE.white,
}))

let cameraAutoStarted = false
let cameraHideTimer = null

function startCameraOnce() {
  if (cameraAutoStarted || manualFallback.value) return
  cameraAutoStarted = true
  gesture.start()
}

function skipGestures() {
  manualFallback.value = true
  cameraHintDismissed.value = true
  guideOpen.value = false
  gesture.stop()
}

async function retryGestures() {
  cameraHintDismissed.value = false
  manualFallback.value = false
  gesture.stop()
  await nextTick()
  later(() => gesture.start(), 80)
}

function dismissCameraHint() {
  cameraHintDismissed.value = true
}

function openGestureGuide() {
  guideOpen.value = true
}

function handleWarpOut() {
  audio.startScene(BGM_SCENES.bloom)
  cameraHintDismissed.value = true
  transitionPhase.value = 'in'
  showTransition.value = true

  later(() => {
    act.value = 'bloom'
    transitionPhase.value = 'out'
    guideOpen.value = false
    // 第二幕不再需要手势：关闭摄像头，把性能留给花海与相册。
    gesture.stop()
  }, TIMING.sceneTransition.coverDelay)

  later(() => {
    showTransition.value = false
  }, TIMING.sceneTransition.coverDelay + TIMING.sceneTransition.overlayFade)
}

function handlePanel(id) {
  if (id === 'letter') {
    openLetter()
    return
  }

  if (id === 'anniversary') {
    openCelebration()
    return
  }

  if (id === 'album') albumOpen.value = true
  else if (id === 'diary') diaryOpen.value = true
  else if (id === 'play') playOpen.value = true

  // 默认相册 / 日记 / 游戏都沿用 bloom；在 BGM_SCENES 里给它们单独指定
  // 场景 key 后，这里会自动换成对应的歌。
  const sceneKey = BGM_SCENES[id] || BGM_SCENES.bloom
  if (sceneKey) audio.startScene(sceneKey)
}

function closePanel(id) {
  if (id === 'album') albumOpen.value = false
  else if (id === 'diary') diaryOpen.value = false
  else if (id === 'play') playOpen.value = false
  if (BGM_SCENES.bloom) audio.setScene(BGM_SCENES.bloom)
}

function openLetter() {
  if (zooming.value || letterVisible.value || letterClosing.value) return
  albumOpen.value = false
  celebrationOpen.value = false
  fireworksOpen.value = false
  diaryOpen.value = false
  playOpen.value = false
  letterClosing.value = false
  zooming.value = true
  guideOpen.value = false
  audio.startScene(BGM_SCENES.letter)
  gesture.stop()
  later(() => {
    letterVisible.value = true
  }, TIMING.bloom.zoomBeforeLetter)
}

function openCelebration() {
  // 从烟花页打开纪念卡时，继续播放 fireworks 场景；从花间小窗打开时才切场景。
  if (!fireworksOpen.value) {
    const sceneKey = BGM_SCENES.anniversary || BGM_SCENES.bloom
    if (sceneKey) audio.startScene(sceneKey)
  }
  celebrationBloom.value = true
  celebrationOpen.value = true
  later(() => {
    celebrationBloom.value = false
  }, 1250)
}

function closeCelebration() {
  celebrationOpen.value = false
  if (!fireworksOpen.value && BGM_SCENES.bloom) {
    audio.setScene(BGM_SCENES.bloom)
  }
}

function openFireworks() {
  audio.startScene(BGM_SCENES.fireworks)
  fireworksOpen.value = true
}

function closeFireworksToFlower() {
  audio.setScene(BGM_SCENES.bloom)
  fireworksOpen.value = false
  closeLetter()
}

function closeLetter() {
  if (!letterVisible.value) return
  fireworksOpen.value = false
  letterClosing.value = true
  letterVisible.value = false
  zooming.value = false
  audio.setScene(BGM_SCENES.bloom)
  later(() => {
    letterClosing.value = false
  }, 2200)
}

function toggleFlowerMode() {
  flowerMode.value = flowerMode.value === 'day' ? 'night' : 'day'
}

function handleAudioInteraction() {
  if (!audio.enabled.value) return
  if (!audio.started.value) {
    void audio.startBgm()
    return
  }
  if (audio.blocked.value) void audio.retryBgm()
}

watch(
  () => gesture.status.value,
  (status) => {
    if (cameraHideTimer) {
      clearTimeout(cameraHideTimer)
      cameraHideTimer = null
    }
    if (status === 'ready' && act.value === 'stars') {
      cameraHideTimer = setTimeout(() => {
        cameraHintDismissed.value = true
      }, 6500)
    } else if (terminalCameraStates.includes(status)) {
      cameraHintDismissed.value = false
    }
  },
)

onMounted(() => {
  later(() => startCameraOnce(), 1350)
  // 页面打开 3 秒后尝试渐进启动第一幕 BGM；若浏览器拦截，第一次点击/按键会重试。
  later(() => audio.startBgm(), TIMING.audio.initialStartDelay ?? 3000)
  window.addEventListener('pointerdown', handleAudioInteraction, { passive: true })
  window.addEventListener('keydown', handleAudioInteraction)
})

onBeforeUnmount(() => {
  for (const timer of timers) clearTimeout(timer)
  timers.clear()
  if (cameraHideTimer) clearTimeout(cameraHideTimer)
  window.removeEventListener('pointerdown', handleAudioInteraction)
  window.removeEventListener('keydown', handleAudioInteraction)
})
</script>

<template>
  <main class="app-shell" :class="themeClass" :style="themeStyle">
    <StarfieldScene
      v-if="act === 'stars'"
      :manual-mode="manualMode"
      @warp-out="handleWarpOut"
    />

    <FlowerSeaScene
      v-else-if="act === 'bloom'"
      :zooming="zooming"
      :suspended="overlayOpen"
      :mode="flowerMode"
      @open-panel="handlePanel"
    />

    <TogetherTimer v-if="showTogetherTimer" :mode="flowerMode" />

    <Transition name="letter-layer">
      <LetterScene
        v-if="letterVisible"
        @open-fireworks="openFireworks"
        @back="closeLetter"
      />
    </Transition>

    <HandCursor
      v-if="showHandCursor"
      :mode="act === 'bloom' ? 'bloom' : 'star'"
    />

    <StarlightTransition
      v-if="showTransition"
      :phase="transitionPhase"
    />

    <AlbumModal v-if="albumOpen" @close="closePanel('album')" />
    <DiaryModal v-if="diaryOpen" @close="closePanel('diary')" />
    <PlayZone v-if="playOpen" @close="closePanel('play')" />
    <div v-if="celebrationBloom" class="celebration-bloom" aria-hidden="true"></div>

    <FireworkScene
      v-if="fireworksOpen"
      @close="closeFireworksToFlower"
      @open-card="openCelebration"
    />

    <CelebrationScene
      v-if="celebrationOpen"
      @close="closeCelebration"
    />

    <CameraHint
      v-if="showCameraHint"
      :status="gesture.status.value"
      :fallback-mode="manualFallback.value"
      :error-message="gesture.errorMessage.value"
      @skip="skipGestures"
      @retry="retryGestures"
      @open-guide="openGestureGuide"
      @dismiss="dismissCameraHint"
    />

    <div
      v-if="!letterVisible"
      class="top-controls"
      :class="{
        'is-transitioning': showTransition,
        'is-overlay-open': overlayOpen || zooming || letterClosing,
      }"
    >
      <GestureStatus
        v-if="act === 'stars'"
        :status="gesture.status.value"
        :fallback-mode="manualFallback.value"
        :gesture-label="gesture.gestureLabel.value"
        @open="openGestureGuide"
      />
      <button
        v-if="act === 'bloom'"
        type="button"
        class="theme-toggle"
        :aria-label="flowerMode === 'day' ? UI.flower.switchToNight : UI.flower.switchToDay"
        :title="flowerMode === 'day' ? UI.flower.switchToNight : UI.flower.switchToDay"
        @click="toggleFlowerMode"
      >
        <span class="theme-icon" aria-hidden="true">{{ flowerMode === 'day' ? '☾' : '☀' }}</span>
        <span class="theme-label">{{ flowerMode === 'day' ? UI.flower.night : UI.flower.day }}</span>
      </button>
      <SoundToggle
        :enabled="audio.enabled.value"
        :started="audio.started.value"
        :blocked="audio.blocked.value"
        :playing="audio.playing.value"
        @toggle="audio.toggleSound"
        @retry="audio.retryBgm"
      />
    </div>
    <div v-else class="top-controls letter-controls">
      <SoundToggle
        :enabled="audio.enabled.value"
        :started="audio.started.value"
        :blocked="audio.blocked.value"
        :playing="audio.playing.value"
        @toggle="audio.toggleSound"
        @retry="audio.retryBgm"
      />
    </div>

    <GestureGuide
      v-if="guideOpen"
      :status="gesture.status.value"
      :error-message="gesture.errorMessage.value"
      :fallback-mode="manualFallback.value"
      :gesture-label="gesture.gestureLabel.value"
      @close="guideOpen = false"
      @retry="retryGestures"
      @skip="skipGestures"
    />

    <div class="grain-overlay" aria-hidden="true"></div>
  </main>
</template>

<style scoped>
.app-shell {
  position: fixed;
  inset: 0;
  overflow: hidden;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background: var(--night-deep, #04050b);
  color: var(--cream, #f8f1e8);
  isolation: isolate;
}

.top-controls {
  position: fixed;
  top: calc(16px + env(safe-area-inset-top));
  right: max(16px, env(safe-area-inset-right));
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: controls-in 1.2s ease 0.5s backwards;
  transition: opacity 0.65s ease;
}

.letter-controls {
  animation-delay: 0.1s;
}

.top-controls.is-transitioning,
.top-controls.is-overlay-open {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.45s ease;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--ui-border, rgba(255, 250, 240, 0.5));
  border-radius: 999px;
  color: var(--ui-ink, rgba(94, 73, 79, 0.72));
  background: var(--ui-bg, rgba(255, 250, 243, 0.42));
  box-shadow: var(--ui-shadow, 0 10px 28px rgba(108, 82, 79, 0.1));
  backdrop-filter: blur(14px);
  font-size: 9px;
  letter-spacing: 0.08em;
  transition:
    color 0.3s ease,
    background 0.3s ease,
    transform 0.3s ease;
}

.theme-toggle:hover {
  transform: translateY(-1px);
  background: rgba(255, 250, 243, 0.7);
}

.theme-icon {
  color: rgba(184, 132, 126, 0.8);
  font-size: 13px;
  line-height: 1;
}

.theme-label {
  white-space: nowrap;
}

.celebration-bloom {
  position: fixed;
  inset: 0;
  z-index: 275;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 54%, rgba(255, 251, 241, 0.96) 0%, rgba(250, 228, 225, 0.7) 34%, transparent 72%),
    rgba(255, 248, 240, 0.5);
  animation: celebration-bloom 1.35s ease both;
}

@keyframes celebration-bloom {
  0% {
    opacity: 0;
  }
  22% {
    opacity: 0.95;
  }
  100% {
    opacity: 0;
  }
}

.letter-layer-enter-active,
.letter-layer-leave-active {
  transition: opacity 2.2s ease;
}

.letter-layer-enter-from,
.letter-layer-leave-to {
  opacity: 0;
}

@keyframes controls-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 620px) {
  .top-controls {
    top: calc(14px + env(safe-area-inset-top));
    right: 12px;
    gap: 6px;
  }
}
</style>
