<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ANNIVERSARY_DATE, UI } from '@/config/story'
import { sampleStarText } from '@/utils/starText'

const props = defineProps({
  text: { type: String, default: ANNIVERSARY_DATE },
  color: { type: String, default: '#c3a681' },
})

const wrapperEl = ref(null)
const canvasEl = ref(null)

let observer = null
let rafHandle = 0
let ctx = null
let width = 0
let height = 0
let dpr = 1
let points = []
let sprite = null

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean
  const value = Number.parseInt(full, 16)
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`
}

function makeSprite() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const sctx = canvas.getContext('2d')
  if (!sctx) return null
  const rgb = hexToRgb(props.color)
  const gradient = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, `rgba(${rgb}, 1)`)
  gradient.addColorStop(0.16, `rgba(${rgb}, 0.7)`)
  gradient.addColorStop(0.52, `rgba(${rgb}, 0.1)`)
  gradient.addColorStop(1, `rgba(${rgb}, 0)`)
  sctx.fillStyle = gradient
  sctx.fillRect(0, 0, size, size)
  return canvas
}

function rebuild() {
  const element = wrapperEl.value
  const canvas = canvasEl.value
  if (!element || !canvas) return
  const rect = element.getBoundingClientRect()
  width = Math.max(1, rect.width)
  height = Math.max(1, rect.height)
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const field = sampleStarText({
    text: props.text,
    width,
    height,
    centerYRatio: 0.5,
    maxFontRatio: 0.13,
    maxWidthRatio: 0.88,
    targetCount: width < 520 ? 180 : 290,
  })
  points = field.points
  sprite = makeSprite()
}

function draw(now) {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  if (!sprite) {
    rafHandle = requestAnimationFrame(draw)
    return
  }
  ctx.globalCompositeOperation = 'lighter'
  for (const point of points) {
    const alpha = 0.14 + 0.34 * (0.5 + 0.5 * Math.sin(now * 0.0011 + point.phase))
    const size = 5 + point.jitter * 5 + (0.5 + 0.5 * Math.sin(now * 0.0014 + point.phase)) * 2
    ctx.globalAlpha = alpha
    ctx.drawImage(
      sprite,
      point.nx * width - size / 2,
      point.ny * height - size / 2,
      size,
      size,
    )
  }
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  rafHandle = requestAnimationFrame(draw)
}

onMounted(() => {
  rebuild()
  observer = new ResizeObserver(rebuild)
  if (wrapperEl.value) observer.observe(wrapperEl.value)
  rafHandle = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafHandle)
  observer?.disconnect()
})
</script>

<template>
  <div ref="wrapperEl" class="star-date" role="img" :aria-label="UI.starDateAria(text)">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<style scoped>
.star-date {
  position: absolute;
  left: 50%;
  top: 9%;
  width: min(780px, 86vw);
  height: clamp(74px, 13vh, 132px);
  transform: translateX(-50%);
  pointer-events: none;
  opacity: 0.78;
  filter: drop-shadow(0 0 14px rgba(183, 146, 105, 0.34));
  animation: date-echo 1.8s ease both;
  z-index: 16;
}

.star-date canvas {
  display: block;
  width: 100%;
  height: 100%;
}

@keyframes date-echo {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px) scale(0.97);
  }
  to {
    opacity: 0.78;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}
</style>
