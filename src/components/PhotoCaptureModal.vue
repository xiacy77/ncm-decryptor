<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { UI } from '@/config/story'

const emit = defineEmits(['close', 'save'])

const step = ref('choose')
const previewUrl = ref('')
const cameraError = ref('')
const busy = ref(false)
const cameraReady = ref(false)
const videoEl = ref(null)
const fileInput = ref(null)
const closeButton = ref(null)

let stream = null
let previousFocus = null

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }
  if (videoEl.value) {
    videoEl.value.pause()
    videoEl.value.srcObject = null
  }
}

async function waitForVideoElement(timeout = 1800) {
  const startedAt = performance.now()
  while (!videoEl.value && performance.now() - startedAt < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 45))
  }
  return videoEl.value
}

const close = () => {
  stopCamera()
  emit('close')
}

async function startCamera() {
  cameraError.value = ''
  previewUrl.value = ''
  cameraReady.value = false
  step.value = 'camera'
  busy.value = true
  await nextTick()

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = UI.photo.cameraError
    step.value = 'choose'
    busy.value = false
    return
  }

  try {
    await waitForVideoElement()
    if (!videoEl.value) {
      cameraError.value = UI.photo.cameraError
      step.value = 'choose'
      busy.value = false
      return
    }
    stopCamera()
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: { ideal: 1080 },
        height: { ideal: 1440 },
      },
    })
    if (!videoEl.value) {
      stopCamera()
      return
    }
    videoEl.value.srcObject = stream
    videoEl.value.muted = true
    videoEl.value.playsInline = true
    await videoEl.value.play()
    if (videoEl.value.readyState < 1) {
      await new Promise((resolve) => {
        const video = videoEl.value
        const done = () => {
          video?.removeEventListener('loadedmetadata', done)
          resolve()
        }
        video?.addEventListener('loadedmetadata', done, { once: true })
        setTimeout(done, 2500)
      })
    }
    cameraReady.value = Boolean(videoEl.value?.videoWidth)
  } catch {
    cameraError.value = UI.photo.cameraError
    stopCamera()
    step.value = 'choose'
  } finally {
    busy.value = false
  }
}

function capturePhoto() {
  const video = videoEl.value
  if (!video || !video.videoWidth || !video.videoHeight) {
    cameraError.value = UI.photo.cameraStarting
    return
  }

  const targetWidth = 900
  const targetHeight = 1600
  const targetRatio = targetWidth / targetHeight
  const sourceRatio = video.videoWidth / video.videoHeight
  let sourceWidth = video.videoWidth
  let sourceHeight = video.videoHeight
  let sourceX = 0
  let sourceY = 0

  if (sourceRatio > targetRatio) {
    sourceWidth = video.videoHeight * targetRatio
    sourceX = (video.videoWidth - sourceWidth) / 2
  } else {
    sourceHeight = video.videoWidth / targetRatio
    sourceY = (video.videoHeight - sourceHeight) / 2
  }

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.save()
  ctx.translate(targetWidth, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(
    video,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  )
  ctx.restore()
  previewUrl.value = canvas.toDataURL('image/jpeg', 0.92)
  cameraReady.value = false
  stopCamera()
  step.value = 'preview'
}

function chooseUpload() {
  fileInput.value?.click()
}

function handleFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    cameraError.value = UI.photo.fileError
    return
  }
  cameraError.value = ''
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result !== 'string') return
    previewUrl.value = reader.result
    stopCamera()
    step.value = 'preview'
  }
  reader.onerror = () => {
    cameraError.value = UI.photo.fileError
  }
  reader.readAsDataURL(file)
}

function savePhoto() {
  if (!previewUrl.value) return
  emit('save', previewUrl.value)
  stopCamera()
}

function retake() {
  previewUrl.value = ''
  startCamera()
}

function reupload() {
  previewUrl.value = ''
  chooseUpload()
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

onMounted(async () => {
  previousFocus = document.activeElement
  window.addEventListener('keydown', handleKeydown)
  await nextTick()
  closeButton.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopCamera()
  if (previousFocus instanceof HTMLElement) previousFocus.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="photo-overlay" @click.self="close">
      <div class="photo-card" role="dialog" aria-modal="true" aria-labelledby="photo-title">
        <button
          ref="closeButton"
          type="button"
          class="photo-close"
          :aria-label="UI.photo.closeAria"
          @click="close"
        >
          ×
        </button>

        <Transition name="photo-step" mode="out-in">
          <div v-if="step === 'choose'" key="choose" class="photo-step choose-step">
            <p class="photo-kicker">{{ UI.photo.kickerChoose }}</p>
            <h2 id="photo-title" class="photo-title">{{ UI.photo.title }}</h2>
            <p class="photo-subtitle">{{ UI.photo.subtitle }}</p>

            <div class="photo-choices">
              <button type="button" class="choice-button camera" @click="startCamera">
                <span class="choice-icon" aria-hidden="true">◉</span>
                <span>{{ UI.photo.takePhoto }}</span>
              </button>
              <button type="button" class="choice-button" @click="chooseUpload">
                <span class="choice-icon" aria-hidden="true">▧</span>
                <span>{{ UI.photo.upload }}</span>
              </button>
            </div>

            <p v-if="cameraError" class="photo-error">{{ cameraError }}</p>
            <button type="button" class="photo-text-button" @click="close">
              {{ UI.photo.cancel }}
            </button>
          </div>

          <div v-else-if="step === 'camera'" key="camera" class="photo-step camera-step">
            <p class="photo-kicker">{{ UI.photo.kickerCamera }}</p>
            <h2 id="photo-title" class="photo-title">{{ UI.photo.takePhoto }}</h2>

            <div class="camera-viewport">
              <video
                ref="videoEl"
                autoplay
                muted
                playsinline
                @loadedmetadata="cameraReady = true"
                @canplay="cameraReady = true"
                @playing="cameraReady = true"
                @error="cameraError = UI.photo.cameraError"
              ></video>
              <span class="camera-vignette" aria-hidden="true"></span>
              <span class="camera-guide" aria-hidden="true"></span>
              <span v-if="busy || !cameraReady" class="camera-loading">
                {{ UI.photo.cameraStarting }}
              </span>
            </div>

            <p class="photo-note">{{ UI.photo.mirrored }}</p>
            <p v-if="cameraError" class="photo-error">{{ cameraError }}</p>

            <div class="camera-actions">
              <button type="button" class="photo-text-button" @click="close">
                {{ UI.photo.cancel }}
              </button>
              <button
                type="button"
                class="shutter-button"
                :disabled="busy || !cameraReady"
                :aria-label="UI.photo.shoot"
                @click="capturePhoto"
              >
                <span></span>
              </button>
              <button type="button" class="photo-text-button" @click="chooseUpload">
                {{ UI.photo.upload }}
              </button>
            </div>
          </div>

          <div v-else key="preview" class="photo-step preview-step">
            <p class="photo-kicker">{{ UI.photo.kickerPreview }}</p>
            <h2 id="photo-title" class="photo-title">{{ UI.photo.captureSuccess }}</h2>

            <div class="preview-frame">
              <img :src="previewUrl" alt="" />
            </div>

            <div class="preview-actions">
              <button type="button" class="photo-text-button" @click="retake">
                {{ UI.photo.retake }}
              </button>
              <button type="button" class="save-photo-button" @click="savePhoto">
                {{ UI.photo.savePhoto }}
              </button>
              <button type="button" class="photo-text-button" @click="reupload">
                {{ UI.photo.reupload }}
              </button>
            </div>
            <button type="button" class="photo-text-button cancel-preview" @click="close">
              {{ UI.photo.cancel }}
            </button>
          </div>
        </Transition>

        <input
          ref="fileInput"
          class="hidden-file"
          type="file"
          accept="image/*"
          @change="handleFile"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.photo-overlay {
  position: fixed;
  inset: 0;
  z-index: 330;
  display: grid;
  place-items: center;
  padding: 18px;
  background:
    radial-gradient(ellipse 55% 60% at 50% 35%, rgba(255, 247, 242, 0.14), transparent 70%),
    rgba(41, 29, 36, 0.56);
  backdrop-filter: blur(14px);
  animation: photo-overlay-in 0.4s ease both;
}

.photo-card {
  position: relative;
  width: min(460px, 94vw);
  max-height: 92vh;
  overflow: auto;
  padding: clamp(23px, 4vw, 34px);
  border: 1px solid rgba(255, 251, 244, 0.8);
  border-radius: 28px;
  background:
    radial-gradient(ellipse 60% 40% at 20% 0%, rgba(255, 255, 255, 0.85), transparent 72%),
    linear-gradient(145deg, #fff8f1, #f7e3e4 54%, #f3e7dc);
  box-shadow:
    0 35px 95px rgba(36, 22, 29, 0.36),
    inset 0 0 50px rgba(255, 255, 255, 0.2);
  color: #614d54;
  animation: photo-card-in 0.55s cubic-bezier(0.2, 0.76, 0.25, 1) both;
  scrollbar-width: thin;
}

.photo-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(142, 107, 109, 0.14);
  border-radius: 50%;
  color: rgba(109, 82, 84, 0.6);
  background: rgba(255, 250, 243, 0.48);
  font-size: 21px;
  font-weight: 300;
  line-height: 1;
}

.photo-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.photo-kicker {
  margin: 0 0 5px;
  color: rgba(172, 121, 134, 0.6);
  font-family: 'Georgia', serif;
  font-size: 8px;
  letter-spacing: 0.24em;
}

.photo-title {
  margin: 0;
  color: #685056;
  font-family: var(--font-display);
  font-size: clamp(20px, 3vw, 26px);
  font-weight: 400;
  letter-spacing: 0.1em;
}

.photo-subtitle {
  margin: 8px 0 0;
  color: rgba(110, 86, 88, 0.56);
  font-size: 10px;
  line-height: 1.8;
}

.photo-choices {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}

.choice-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 48px;
  border: 1px solid rgba(160, 120, 124, 0.16);
  border-radius: 16px;
  color: rgba(102, 77, 82, 0.8);
  background: rgba(255, 250, 243, 0.52);
  font-size: 11px;
  letter-spacing: 0.07em;
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    transform 0.3s ease;
}

.choice-button:hover {
  background: rgba(255, 252, 247, 0.86);
  border-color: rgba(160, 120, 124, 0.26);
  transform: translateY(-1px);
}

.choice-button.camera {
  color: rgba(255, 250, 244, 0.92);
  border-color: rgba(190, 131, 144, 0.42);
  background: linear-gradient(145deg, #cf9ca9, #bd8392);
}

.choice-button.camera:hover {
  background: linear-gradient(145deg, #d6a5b1, #c58c9a);
}

.choice-icon {
  font-size: 15px;
  opacity: 0.8;
}

.photo-error {
  margin: 13px 0 0;
  padding: 8px 12px;
  border-radius: 10px;
  color: #985f69;
  background: rgba(246, 216, 218, 0.5);
  font-size: 9px;
  line-height: 1.7;
}

.photo-text-button {
  margin-top: 16px;
  padding: 6px 13px;
  border: none;
  color: rgba(111, 85, 88, 0.52);
  background: transparent;
  font-size: 10px;
  letter-spacing: 0.06em;
}

.photo-text-button:hover {
  color: #6e4f56;
}

.camera-viewport {
  position: relative;
  width: min(300px, 70vw);
  aspect-ratio: 9 / 16;
  margin-top: 18px;
  overflow: hidden;
  border: 7px solid rgba(255, 250, 242, 0.72);
  border-radius: 24px;
  background: #d7c4c5;
  box-shadow:
    0 18px 35px rgba(98, 65, 73, 0.18),
    inset 0 0 22px rgba(72, 46, 52, 0.08);
}

.camera-viewport video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transform: scaleX(-1);
}

.camera-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(65, 45, 52, 0.16), transparent 18%, transparent 82%, rgba(65, 45, 52, 0.18)),
    radial-gradient(ellipse at center, transparent 58%, rgba(67, 44, 52, 0.14));
}

.camera-guide {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 62%;
  height: 82%;
  border: 1px solid rgba(255, 250, 241, 0.38);
  border-radius: 46% 46% 40% 40%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 100vmax rgba(60, 38, 47, 0.07);
  pointer-events: none;
}

.camera-loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 8px 12px;
  border-radius: 999px;
  color: rgba(255, 250, 243, 0.88);
  background: rgba(64, 44, 51, 0.38);
  font-size: 9px;
  letter-spacing: 0.07em;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.photo-note {
  margin: 10px 0 0;
  color: rgba(120, 94, 95, 0.45);
  font-size: 8px;
  letter-spacing: 0.04em;
}

.camera-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(310px, 78vw);
  margin-top: 14px;
}

.camera-actions .photo-text-button {
  margin: 0;
}

.shutter-button {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border: 2px solid rgba(255, 251, 244, 0.86);
  border-radius: 50%;
  background: rgba(207, 156, 168, 0.3);
  box-shadow:
    0 0 0 5px rgba(207, 156, 168, 0.14),
    0 8px 18px rgba(119, 76, 86, 0.14);
  transition: transform 0.25s ease;
}

.shutter-button:hover {
  transform: scale(1.05);
}

.shutter-button span {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(145deg, #f3d8dc, #d3a4b0);
}

.preview-frame {
  width: min(260px, 62vw);
  aspect-ratio: 9 / 16;
  margin-top: 18px;
  overflow: hidden;
  border: 7px solid rgba(255, 251, 244, 0.78);
  border-radius: 22px;
  box-shadow:
    0 18px 35px rgba(98, 65, 73, 0.18),
    inset 0 0 22px rgba(72, 46, 52, 0.08);
}

.preview-frame img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 12px;
  margin-top: 15px;
}

.preview-actions .photo-text-button {
  margin: 0;
}

.save-photo-button {
  padding: 10px 22px;
  border: 1px solid rgba(255, 249, 241, 0.36);
  border-radius: 999px;
  color: rgba(255, 250, 244, 0.92);
  background: linear-gradient(145deg, #cf9ca9, #bb8190);
  font-size: 11px;
  letter-spacing: 0.08em;
  box-shadow: 0 8px 22px rgba(157, 101, 114, 0.2);
}

.cancel-preview {
  margin-top: 9px;
  font-size: 9px;
}

.hidden-file {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.photo-step-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.photo-step-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.photo-step-enter-from,
.photo-step-leave-to {
  opacity: 0;
  transform: translateY(7px);
}

@keyframes photo-overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes photo-card-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 620px) {
  .photo-card {
    border-radius: 23px;
    padding: 22px 18px;
  }

  .camera-viewport {
    width: min(250px, 65vw);
  }

  .preview-frame {
    width: min(230px, 58vw);
  }
}
</style>
