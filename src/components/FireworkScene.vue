<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { FIREWORKS } from '@/config/story'
import { AUDIO_KEY } from '@/keys'

const emit = defineEmits(['close', 'open-card'])

const canvasEl = ref(null)
const audio = inject(AUDIO_KEY, null)

let ctx = null
let width = 0
let height = 0
let dpr = 1
let rafHandle = 0
let running = false
let spawnTimer = 0
let rockets = []
let canvasNode = null
let canvasClickHandler = null
let resizeHandler = null
const burstTimers = new Set()

const musicLabel = computed(() => {
  if (!audio) return FIREWORKS.musicOff
  if (audio.blocked?.value) return FIREWORKS.musicBlocked
  return audio.playing?.value ? FIREWORKS.musicOn : FIREWORKS.musicOff
})

function toggleMusic() {
  if (!audio) return
  if (audio.blocked?.value) {
    audio.retryBgm?.()
    return
  }
  if (!audio.enabled?.value) {
    audio.toggleSound?.()
    return
  }
  if (!audio.started?.value) {
    audio.startBgm?.()
    return
  }
  audio.toggleSound?.()
}

function startFireworks() {
  const canvas = canvasEl.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  running = true

  const colors = [
    '#ff4785', '#ff7eb6', '#ffb3d9',
    '#ffd1dc', '#ffffff', '#ffd700',
    '#ff92a6', '#ff2d6f', '#ffa07a',
  ]

  class Particle {
    constructor(x, y, color) {
      this.x = x
      this.y = y
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 4 + 1.5
      this.vx = Math.cos(angle) * speed
      this.vy = Math.sin(angle) * speed
      this.color = color
      this.life = 255
      this.decay = Math.random() * 4 + 3
      this.gravity = 0.04
    }

    update() {
      this.x += this.vx
      this.y += this.vy
      this.vy += this.gravity
      this.vx *= 0.99
      this.life -= this.decay
    }

    draw() {
      if (this.life <= 0) return
      ctx.beginPath()
      ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.globalAlpha = Math.max(0, this.life / 255)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  class Rocket {
    constructor(startX) {
      this.x = startX ?? Math.random() * (width - 100) + 50
      this.y = height
      this.vy = -(Math.random() * 2 + 11)
      this.color = colors[Math.floor(Math.random() * colors.length)]
      this.targetY = Math.random() * (height / 2 - 120) + 80
      this.exploded = false
      this.particles = []
    }

    update() {
      if (!this.exploded) {
        this.y += this.vy
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x, this.y + 10)
        ctx.strokeStyle = this.color
        ctx.globalAlpha = 0.6
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.globalAlpha = 1

        if (this.y <= this.targetY) {
          this.exploded = true
          const count = Math.floor(Math.random() * 60) + 120
          for (let index = 0; index < count; index += 1) {
            this.particles.push(new Particle(this.x, this.y, this.color))
          }
        }
      } else {
        for (const particle of this.particles) particle.update()
        this.particles = this.particles.filter((particle) => particle.life > 0)
      }
    }

    draw() {
      if (!this.exploded) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, 1.6, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.shadowBlur = 8
        ctx.shadowColor = this.color
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        for (const particle of this.particles) particle.draw()
      }
    }
  }

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function loop() {
    if (!running) return
    ctx.fillStyle = 'rgba(0, 0, 10, 0.18)'
    ctx.fillRect(0, 0, width, height)

    spawnTimer += 1
    if (spawnTimer > 18) {
      rockets.push(new Rocket())
      spawnTimer = 0
    }

    if (Math.random() < 0.015) {
      for (let index = 0; index < 4; index += 1) {
        const timer = window.setTimeout(() => {
          burstTimers.delete(timer)
          if (running) rockets.push(new Rocket())
        }, index * 120)
        burstTimers.add(timer)
      }
    }

    for (const rocket of rockets) rocket.update()
    for (const rocket of rockets) rocket.draw()

    rockets = rockets.filter(
      (rocket) => !(rocket.exploded && rocket.particles.length === 0),
    )
    rafHandle = requestAnimationFrame(loop)
  }

  function spawnBurst(x, y, color, count = 130) {
    const burst = new Rocket(x)
    burst.x = x
    burst.y = y
    burst.color = color
    burst.exploded = true
    for (let index = 0; index < count; index += 1) {
      burst.particles.push(new Particle(x, y, color))
    }
    rockets.push(burst)
  }

  function handleCanvasClick(event) {
    const rocket = new Rocket(event.clientX)
    rocket.targetY = event.clientY
    rockets.push(rocket)
  }

  function handleResize() {
    resize()
  }

  canvasNode = canvas
  canvasClickHandler = handleCanvasClick
  resizeHandler = handleResize
  resize()
  spawnTimer = 12

  // 开场先送几朵烟花，避免刚进入时画面空一拍。
  spawnBurst(width * 0.5, height * 0.34, '#ff7eb6', 160)
  spawnBurst(width * 0.22, height * 0.26, '#ffd700', 115)
  rockets.push(new Rocket(width * 0.24))
  rockets.push(new Rocket(width * 0.76))

  const openingBursts = [
    [420, 0.72, 0.26, '#ff4785'],
    [1000, 0.47, 0.4, '#ffffff'],
    [1650, 0.32, 0.33, '#ffb3d9'],
    [2250, 0.68, 0.38, '#ffa07a'],
  ]
  for (const [delay, xRatio, yRatio, color] of openingBursts) {
    const timer = window.setTimeout(() => {
      burstTimers.delete(timer)
      if (running) spawnBurst(width * xRatio, height * yRatio, color, 110)
    }, delay)
    burstTimers.add(timer)
  }

  canvas.addEventListener('pointerdown', canvasClickHandler)
  window.addEventListener('resize', resizeHandler)
  rafHandle = requestAnimationFrame(loop)
}

onMounted(startFireworks)

onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(rafHandle)
  if (canvasNode && canvasClickHandler) {
    canvasNode.removeEventListener('pointerdown', canvasClickHandler)
  }
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  for (const timer of burstTimers) clearTimeout(timer)
  burstTimers.clear()
})
</script>

<template>
  <Teleport to="body">
    <div class="firework-overlay" role="dialog" aria-modal="true" :aria-label="FIREWORKS.title">
      <canvas ref="canvasEl" class="firework-canvas" aria-hidden="true"></canvas>

      <header class="firework-title">
        {{ FIREWORKS.title }}
        <small>{{ FIREWORKS.subtitle }}</small>
      </header>

      <p class="firework-blessing">
        {{ FIREWORKS.blessing }}
        <span>{{ FIREWORKS.blessingSub }}</span>
      </p>

      <button
        type="button"
        class="firework-music"
        :aria-label="musicLabel"
        :aria-pressed="Boolean(audio?.playing?.value)"
        @click="toggleMusic"
      >
        <span aria-hidden="true">{{ audio?.playing?.value ? '🎶' : '🎵' }}</span>
        <span class="music-text">{{ musicLabel }}</span>
      </button>

      <div class="firework-bottom">
        <button type="button" class="firework-card-link" @click="emit('open-card')">
          {{ FIREWORKS.card }}
        </button>
        <button type="button" class="firework-back" @click="emit('close')">
          {{ FIREWORKS.back }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.firework-overlay {
  position: fixed;
  inset: 0;
  z-index: 265;
  overflow: hidden;
  background: #000;
  color: #ffe4f1;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  animation: firework-in 1.3s ease both;
  isolation: isolate;
}

.firework-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.firework-title {
  position: absolute;
  top: 24px;
  left: 0;
  z-index: 10;
  width: 100%;
  color: #ffe4f1;
  font-size: 22px;
  letter-spacing: 6px;
  line-height: 1.4;
  text-align: center;
  text-shadow:
    0 0 8px #ff7eb6,
    0 0 18px #ff4785,
    0 0 30px #ff2d6f;
  pointer-events: none;
  user-select: none;
}

.firework-title small {
  display: block;
  margin-top: 6px;
  color: #ffd1e8;
  font-size: 13px;
  letter-spacing: 3px;
  opacity: 0.85;
}

.firework-blessing {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 8;
  width: min(92vw, 760px);
  margin: 0;
  color: #fff;
  font-size: 26px;
  letter-spacing: 4px;
  line-height: 1.5;
  text-align: center;
  text-shadow:
    0 0 10px #ff4785,
    0 0 20px #ff7eb6,
    0 0 40px #ffb3d9;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;
  animation: blessing-fade 4s ease-in-out infinite;
}

.firework-blessing span {
  display: block;
  margin-top: 10px;
  color: #ffe4f1;
  font-size: 16px;
  letter-spacing: 2px;
}

.firework-music {
  position: absolute;
  top: 24px;
  right: 20px;
  z-index: 11;
  padding: 8px 14px;
  border: 1px solid rgba(255, 182, 212, 0.6);
  border-radius: 20px;
  color: #fff;
  background: rgba(255, 71, 133, 0.25);
  font-size: 13px;
  letter-spacing: 2px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background 0.3s ease;
}

.firework-music:hover {
  background: rgba(255, 71, 133, 0.45);
}

.firework-bottom {
  position: absolute;
  left: 0;
  bottom: max(24px, env(safe-area-inset-bottom));
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.firework-back,
.firework-card-link {
  display: inline-block;
  padding: 10px 26px;
  border-radius: 30px;
  color: #fff;
  font-size: 14px;
  letter-spacing: 3px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition:
    background 0.3s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.firework-back {
  border: 1px solid rgba(255, 182, 212, 0.6);
  background: rgba(255, 71, 133, 0.25);
  box-shadow:
    0 0 12px rgba(255, 71, 133, 0.6),
    0 0 24px rgba(255, 126, 182, 0.35);
}

.firework-card-link {
  border: 1px solid rgba(255, 224, 236, 0.25);
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
}

.firework-back:hover,
.firework-card-link:hover {
  background: rgba(255, 71, 133, 0.45);
  transform: translateY(-2px);
  box-shadow:
    0 0 18px rgba(255, 71, 133, 0.8),
    0 0 35px rgba(255, 126, 182, 0.55);
}

.firework-back:focus-visible,
.firework-card-link:focus-visible,
.firework-music:focus-visible {
  outline: 1px solid rgba(255, 220, 236, 0.9);
  outline-offset: 3px;
}

@keyframes firework-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes blessing-fade {
  0%,
  100% {
    opacity: 0;
    transform: translate(-50%, -58%);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

@media (max-width: 600px) {
  .firework-title {
    font-size: 18px;
  }

  .firework-blessing {
    font-size: 20px;
  }

  .firework-blessing span {
    font-size: 13px;
  }

  .firework-music {
    top: 24px;
    right: 12px;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    padding: 0;
    border-radius: 50%;
    font-size: 16px;
    letter-spacing: 0;
  }

  .music-text {
    display: none;
  }

  .firework-bottom {
    flex-direction: column;
    gap: 8px;
  }

  .firework-back,
  .firework-card-link {
    font-size: 13px;
    padding: 9px 22px;
  }
}
</style>
