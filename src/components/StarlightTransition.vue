<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { rand } from '@/utils/math'

const props = defineProps({
  phase: { type: String, default: 'in' },
})

const canvasEl = ref(null)
let ctx = null
let width = 0
let height = 0
let dpr = 1
let rafHandle = 0
let startAt = 0
let stars = []
let petals = []
let observer = null

const palette = [
  '255, 247, 230',
  '220, 212, 244',
  '242, 197, 210',
  '229, 208, 175',
  '200, 215, 242',
]

function buildScene() {
  const canvas = canvasEl.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  width = Math.max(1, rect.width)
  height = Math.max(1, rect.height)
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.lineCap = 'round'

  const count = width < 700 ? 150 : 260
  stars = Array.from({ length: count }, () => ({
    angle: rand(0, Math.PI * 2),
    offset: rand(0, 0.36),
    speed: rand(0.5, 1.5),
    length: rand(0.4, 1.7),
    width: rand(0.5, 1.7),
    color: palette[Math.floor(Math.random() * palette.length)],
    alpha: rand(0.24, 0.85),
  }))

  petals = Array.from({ length: width < 700 ? 12 : 20 }, () => ({
    x: rand(0.08, 0.92),
    y: rand(0.15, 0.85),
    angle: rand(0, Math.PI * 2),
    speed: rand(0.15, 0.55),
    size: rand(4, 11),
    rotation: rand(0, Math.PI * 2),
    spin: rand(-1, 1),
    color: Math.random() > 0.5 ? '243, 198, 207' : '241, 223, 201',
  }))
}

function draw(now) {
  if (!ctx) return
  const elapsed = (now - startAt) / 1000
  const progress = Math.min(1, elapsed / 2.2)
  const eased = progress * progress
  const fadeOut = props.phase === 'out' ? 0.7 : 1

  ctx.clearRect(0, 0, width, height)
  const cx = width * 0.5
  const cy = height * 0.48
  const maxRadius = Math.hypot(width, height) * 0.64

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.3)
  glow.addColorStop(0, `rgba(255, 250, 238, ${0.45 * fadeOut})`)
  glow.addColorStop(0.13, `rgba(236, 222, 238, ${0.18 * fadeOut})`)
  glow.addColorStop(0.5, 'rgba(167, 172, 210, 0.04)')
  glow.addColorStop(1, 'rgba(20, 24, 45, 0)')
  ctx.fillStyle = glow
  ctx.globalAlpha = 1
  ctx.fillRect(0, 0, width, height)

  ctx.globalCompositeOperation = 'lighter'
  for (const star of stars) {
    const start = (star.offset + eased * star.speed) * maxRadius
    if (start > maxRadius) continue
    const tail = 22 + eased * 240 * star.length
    const x1 = cx + Math.cos(star.angle) * start
    const y1 = cy + Math.sin(star.angle) * start
    const x2 = cx + Math.cos(star.angle) * (start + tail)
    const y2 = cy + Math.sin(star.angle) * (start + tail)
    ctx.globalAlpha = star.alpha * Math.sin(Math.PI * Math.min(1, progress * 0.9 + 0.1)) * fadeOut
    ctx.strokeStyle = `rgba(${star.color}, 0.78)`
    ctx.lineWidth = star.width
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  for (const petal of petals) {
    const orbit = elapsed * petal.speed
    const x = petal.x * width + Math.cos(petal.angle + orbit) * (18 + progress * 26)
    const y = petal.y * height + Math.sin(petal.angle + orbit) * (14 + progress * 20)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(petal.rotation + elapsed * petal.spin)
    ctx.globalAlpha = (0.12 + progress * 0.3) * fadeOut
    ctx.fillStyle = `rgba(${petal.color}, 0.85)`
    ctx.beginPath()
    ctx.ellipse(0, 0, petal.size, petal.size * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  rafHandle = requestAnimationFrame(draw)
}

onMounted(() => {
  startAt = performance.now()
  buildScene()
  observer = new ResizeObserver(buildScene)
  if (canvasEl.value) observer.observe(canvasEl.value)
  rafHandle = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafHandle)
  observer?.disconnect()
})
</script>

<template>
  <div class="starlight-transition" :class="{ 'is-leaving': phase === 'out' }" aria-hidden="true">
    <canvas ref="canvasEl" class="warp-canvas"></canvas>
    <div class="transition-vortex"></div>
    <div class="transition-rings">
      <span class="transition-ring ring-one"></span>
      <span class="transition-ring ring-two"></span>
      <span class="transition-ring ring-three"></span>
      <span class="transition-ring ring-four"></span>
    </div>
    <div class="transition-core"></div>
    <div class="transition-flash"></div>
  </div>
</template>

<style scoped>
.starlight-transition {
  position: fixed;
  inset: 0;
  z-index: 58;
  overflow: hidden;
  pointer-events: none;
  opacity: 1;
  background:
    radial-gradient(circle at 50% 48%, rgba(255, 250, 238, 0.96) 0%, rgba(240, 224, 228, 0.8) 8%, rgba(201, 198, 226, 0.72) 20%, rgba(117, 122, 160, 0.72) 38%, rgba(30, 34, 61, 0.88) 70%, rgba(16, 19, 38, 0.96) 100%);
  animation: transition-in 0.8s ease;
}

.starlight-transition.is-leaving {
  opacity: 0;
  transition: opacity 1.7s ease;
}

.warp-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.transition-vortex {
  position: absolute;
  left: 50%;
  top: 48%;
  width: 180vmax;
  height: 180vmax;
  transform: translate(-50%, -50%);
  background: repeating-conic-gradient(
    from 0deg,
    transparent 0deg 12deg,
    rgba(255, 246, 231, 0.1) 14deg,
    transparent 17deg 31deg
  );
  -webkit-mask-image: radial-gradient(
    circle,
    transparent 0%,
    transparent 8%,
    #000 22%,
    #000 46%,
    transparent 65%
  );
  mask-image: radial-gradient(
    circle,
    transparent 0%,
    transparent 8%,
    #000 22%,
    #000 46%,
    transparent 65%
  );
  filter: blur(1px);
  animation: transition-vortex-spin 16s linear infinite;
}

.transition-rings {
  position: absolute;
  inset: 0;
}

.transition-ring {
  position: absolute;
  left: 50%;
  top: 48%;
  border: 1px solid rgba(255, 247, 231, 0.28);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: transition-ring 2.4s ease-out infinite;
  box-shadow: 0 0 32px rgba(235, 218, 240, 0.14);
}

.ring-one {
  width: 28vmin;
  height: 28vmin;
}

.ring-two {
  width: 48vmin;
  height: 48vmin;
  animation-delay: -0.55s;
  border-color: rgba(243, 203, 212, 0.22);
}

.ring-three {
  width: 70vmin;
  height: 70vmin;
  animation-delay: -1.15s;
  border-color: rgba(198, 211, 241, 0.18);
}

.ring-four {
  width: 98vmin;
  height: 98vmin;
  animation-delay: -1.75s;
  border-color: rgba(247, 225, 204, 0.12);
}

.transition-core {
  position: absolute;
  left: 50%;
  top: 48%;
  width: 22vmin;
  height: 22vmin;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 252, 242, 0.95) 0%,
    rgba(255, 238, 222, 0.42) 30%,
    rgba(240, 199, 210, 0.16) 56%,
    transparent 76%
  );
  filter: blur(11px);
  animation: transition-core 2.2s ease-in-out infinite alternate;
}

.transition-flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 48%,
    rgba(255, 253, 245, 0.86) 0%,
    rgba(255, 245, 230, 0.24) 26%,
    transparent 58%
  );
  opacity: 0;
  animation: transition-flash 2.2s ease 0.2s both;
}

@keyframes transition-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes transition-vortex-spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes transition-ring {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.1);
  }
  22% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.55);
  }
}

@keyframes transition-core {
  from {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(0.82);
  }
  to {
    opacity: 0.94;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes transition-flash {
  0%,
  12% {
    opacity: 0;
  }
  34% {
    opacity: 0.75;
  }
  100% {
    opacity: 0;
  }
}
</style>
