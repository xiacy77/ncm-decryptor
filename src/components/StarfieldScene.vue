<script setup>
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import CelestialDecor from '@/components/CelestialDecor.vue'
import EarthJourney from '@/components/EarthJourney.vue'
import MemoryTimeline from '@/components/MemoryTimeline.vue'
import MotifField from '@/components/MotifField.vue'
import StarWhispers from '@/components/StarWhispers.vue'
import { ANNIVERSARY_DATE, COPY, TIMING, UI } from '@/config/story'
import { GESTURE_KEY } from '@/keys'
import {
  clamp,
  easeInOutCubic,
  easeOutCubic,
  easeOutQuart,
  rand,
  randInt,
} from '@/utils/math'
import { pointInsideBounds, sampleStarText } from '@/utils/starText'

const props = defineProps({
  manualMode: { type: Boolean, default: false },
})

const emit = defineEmits(['warp-out'])

const gestureApi = inject(GESTURE_KEY, null)
const sceneEl = ref(null)
const canvasEl = ref(null)

const showWelcome = ref(false)
const showEarth = ref(false)
const showWhispers = ref(false)
const canAdvance = ref(false)
const dateHasAppeared = ref(false)
const dateExploreEnabled = ref(false)
const flashPlaying = ref(false)
const landingFlash = ref(false)
const introPhase = ref('emerge')
const manualQuiet = ref(false)
const manualFistActive = ref(false)
const fistPulse = ref(false)
const okPulse = ref(false)
const lovePulse = ref(false)
const fallbackOpen = ref(false)

const journey = reactive({
  triggering: false,
  bubble: false,
  departing: false,
})

const timers = new Set()
let observer = null
let rafHandle = 0
let startAt = 0
let lastFrameAt = 0
let ambientClock = 0
let ctx = null
let width = 0
let height = 0
let dpr = 1

let stars = []
let datePoints = []
let dateBounds = null
let starSprites = []
let warpSeeds = []
let trail = []
let fireworks = []
let heartParticles = []
let dateRevealUntil = 0
let dateHideTimer = null
let nextDateRevealAt = 0
let triggerStartedAt = 0
let lastTrailAt = 0
let lastThumbAt = 0
let lastHeartAt = 0
let homeRevealAt = 0

const pointer = {
  x: 0.5,
  y: 0.36,
  present: false,
}

let manualFistPoint = null
let manualFistTimer = null

const quietMode = computed(
  () => manualQuiet.value || gestureApi?.gesture.value === 'crossed',
)

const advanceLabel = computed(() =>
  props.manualMode ? COPY.manualAdvance : UI.star.manualAdvance,
)

const phaseClass = computed(() => `phase-${introPhase.value}`)

const later = (callback, delay) => {
  const timer = setTimeout(() => {
    timers.delete(timer)
    callback()
  }, delay)
  timers.add(timer)
  return timer
}

const clearTimers = () => {
  for (const timer of timers) clearTimeout(timer)
  timers.clear()
  if (manualFistTimer) clearTimeout(manualFistTimer)
  manualFistTimer = null
}

function makeGlowSprite(rgb) {
  const size = 96
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const sctx = sprite.getContext('2d')
  if (!sctx) return sprite
  const gradient = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, `rgba(${rgb}, 1)`)
  gradient.addColorStop(0.08, `rgba(${rgb}, 0.95)`)
  gradient.addColorStop(0.24, `rgba(${rgb}, 0.38)`)
  gradient.addColorStop(0.6, `rgba(${rgb}, 0.08)`)
  gradient.addColorStop(1, `rgba(${rgb}, 0)`)
  sctx.fillStyle = gradient
  sctx.fillRect(0, 0, size, size)
  return sprite
}

function buildSprites() {
  starSprites = [
    makeGlowSprite('250, 244, 234'),
    makeGlowSprite('198, 214, 241'),
    makeGlowSprite('234, 197, 211'),
    makeGlowSprite('235, 216, 179'),
    makeGlowSprite('214, 211, 240'),
  ]
}

function createStars() {
  const count = width < 560 ? 230 : width < 1000 ? 360 : 480
  stars = Array.from({ length: count }, () => {
    // 一部分星子更亮，让手势经过时能立刻看见光点被搅动。
    const bright = Math.random() < 0.17
    return {
      nx: Math.random(),
      ny: Math.random(),
      size: bright ? rand(2.2, 3.4) : rand(1, 2.6),
      alpha: bright ? rand(0.68, 1) : rand(0.3, 0.86),
      phase: rand(0, Math.PI * 2),
      twinkleSpeed: rand(0.35, 1.15),
      drift: rand(2, 14),
      driftSpeed: rand(0.15, 0.55),
      colorIndex: randInt(0, 4),
      ox: 0,
      oy: 0,
      orbit: rand(0.012, 0.1),
      orbitAngle: rand(0, Math.PI * 2),
      burstAngle: 0,
      burstSpeed: 0,
      burstOffset: 0,
    }
  })
}

function createDateField() {
  const dateField = sampleStarText({
    text: ANNIVERSARY_DATE,
    width,
    height,
    centerYRatio: width < 700 ? 0.12 : 0.14,
    maxFontRatio: 0.1,
    maxWidthRatio: width < 700 ? 0.82 : 0.72,
    targetCount: width < 700 ? 280 : 480,
  })
  datePoints = dateField.points
  dateBounds = dateField.bounds
}

function createWarpSeeds() {
  const count = width < 700 ? 96 : 164
  warpSeeds = Array.from({ length: count }, () => ({
    angle: rand(0, Math.PI * 2),
    offset: rand(0.02, 0.42),
    speed: rand(0.45, 1.55),
    length: rand(0.5, 1.7),
    alpha: rand(0.26, 0.9),
    colorIndex: randInt(0, 4),
  }))
}

function resize() {
  const element = sceneEl.value
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
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineCap = 'round'
  }

  createStars()
  createDateField()
  createWarpSeeds()
  trail = []
  fireworks = []
  heartParticles = []
}

function drawGlow(x, y, size, alpha, colorIndex = 0) {
  if (alpha <= 0.004) return
  const sprite = starSprites[colorIndex] ?? starSprites[0]
  const drawSize = Math.max(2, size * 5.4)
  ctx.globalAlpha = clamp(alpha, 0, 1)
  ctx.drawImage(sprite, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize)
}

function twinkleOf(star, clock) {
  return 0.55 + 0.45 * Math.sin(clock * 0.001 * star.twinkleSpeed + star.phase)
}

function drawAmbient(now, introProgress = 1) {
  const clock = ambientClock
  for (const star of stars) {
    const x =
      star.nx * width +
      Math.sin(clock * 0.001 * star.driftSpeed + star.phase) * star.drift
    const y =
      star.ny * height +
      Math.cos(clock * 0.0008 * star.driftSpeed + star.phase * 1.4) * star.drift * 0.6
    const twinkle = twinkleOf(star, clock)
    const alpha = star.alpha * introProgress * (0.38 + twinkle * 0.62)
    drawGlow(x, y, star.size, alpha, star.colorIndex)
  }
}

function drawComet(elapsed, startAt, duration, from, to, size = 2.2, opacity = 0.8) {
  const progress = (elapsed - startAt) / duration
  if (progress <= 0 || progress >= 1) return
  const eased = easeOutCubic(progress)
  const headX = width * (from.x + (to.x - from.x) * eased)
  const headY = height * (from.y + (to.y - from.y) * eased)
  const tailLength = width * (0.08 + progress * 0.16)
  const vx = width * (to.x - from.x)
  const vy = height * (to.y - from.y)
  const length = Math.hypot(vx, vy) || 1
  const tailX = headX - (vx / length) * tailLength
  const tailY = headY - (vy / length) * tailLength
  const fade = Math.sin(Math.PI * progress)

  const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY)
  gradient.addColorStop(0, 'rgba(207, 218, 245, 0)')
  gradient.addColorStop(0.55, `rgba(221, 218, 242, ${0.18 * fade * opacity})`)
  gradient.addColorStop(1, `rgba(255, 249, 236, ${0.9 * fade * opacity})`)
  ctx.globalAlpha = 1
  ctx.strokeStyle = gradient
  ctx.lineWidth = size
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(tailX, tailY)
  ctx.lineTo(headX, headY)
  ctx.stroke()

  drawGlow(headX, headY, size * 2.6, 0.9 * fade * opacity, 0)
  drawGlow(headX - vx * 0.012, headY - vy * 0.012, size, 0.55 * fade, 2)
}

function drawEmerge(now, elapsed) {
  const reveal = easeOutCubic(clamp(elapsed / TIMING.starIntro.emergeDuration))
  ambientClock = elapsed
  ctx.globalCompositeOperation = 'lighter'
  for (const star of stars) {
    const x =
      star.nx * width +
      Math.sin(elapsed * 0.00025 + star.phase) * star.drift * 0.6
    const y =
      star.ny * height +
      Math.cos(elapsed * 0.0002 + star.phase) * star.drift * 0.45
    const alpha =
      star.alpha *
      reveal *
      (0.32 + (0.5 + 0.5 * Math.sin(elapsed * 0.0012 + star.phase)) * 0.84)
    drawGlow(x, y, star.size * 1.06, alpha, star.colorIndex)
  }
  drawComet(
    elapsed,
    1250,
    1800,
    { x: 0.05, y: 0.13 },
    { x: 0.82, y: 0.44 },
    width < 700 ? 1.5 : 2.1,
    0.75,
  )
  drawComet(
    elapsed,
    2400,
    1450,
    { x: 0.92, y: 0.18 },
    { x: 0.22, y: 0.55 },
    width < 700 ? 1.1 : 1.6,
    0.48,
  )
}

function drawGather(now, elapsed) {
  const intro = TIMING.starIntro
  const progress = easeInOutCubic(
    clamp((elapsed - intro.gatherAt) / intro.gatherDuration),
  )
  ambientClock = elapsed
  ctx.globalCompositeOperation = 'lighter'

  for (const star of stars) {
    const baseX = star.nx * width
    const baseY = star.ny * height
    const targetX =
      width * 0.5 + Math.cos(star.orbitAngle) * width * star.orbit
    const targetY =
      height * 0.44 + Math.sin(star.orbitAngle) * height * star.orbit * 0.7
    const x = baseX + (targetX - baseX) * progress
    const y = baseY + (targetY - baseY) * progress
    const twinkle = 0.6 + 0.4 * Math.sin(elapsed * 0.001 + star.phase)
    const alpha = star.alpha * (0.45 + twinkle * 0.68) * (0.9 + progress * 0.3)
    drawGlow(x, y, star.size * (1 - progress * 0.15), alpha, star.colorIndex)
  }

  // 三圈缓慢收紧的星环，让“汇聚”更有仪式感。
  const cx = width * 0.5
  const cy = height * 0.44
  for (let ring = 0; ring < 3; ring += 1) {
    const ringProgress = clamp(progress * 1.2 - ring * 0.08)
    const radius =
      Math.min(width, height) * (0.34 - ring * 0.08) * (1 - ringProgress * 0.62)
    ctx.globalAlpha = 0.1 * (1 - ringProgress * 0.35) * (0.3 + progress)
    ctx.strokeStyle = ring === 1 ? 'rgba(231, 200, 215, 0.6)' : 'rgba(210, 220, 246, 0.58)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.arc(cx, cy, radius, elapsed * 0.00018 + ring, elapsed * 0.00018 + ring + Math.PI * 1.24)
    ctx.stroke()
  }

  drawComet(
    elapsed,
    3900,
    1800,
    { x: 0.97, y: 0.22 },
    { x: 0.24, y: 0.62 },
    width < 700 ? 1.2 : 1.7,
    0.55,
  )
  drawComet(
    elapsed,
    4850,
    1500,
    { x: 0.08, y: 0.68 },
    { x: 0.72, y: 0.3 },
    width < 700 ? 0.95 : 1.35,
    0.38,
  )
}

function prepareBurst() {
  for (const star of stars) {
    // 一半向右下、一半向左下：两道斜向的流星雨。
    const right = Math.random() > 0.48
    star.burstAngle = right
      ? rand(Math.PI * 0.16, Math.PI * 0.43)
      : rand(Math.PI * 0.57, Math.PI * 0.84)
    star.burstSpeed = rand(0.5, 1.25)
    star.burstOffset = rand(0, 0.045)
  }
}

function drawBurst(elapsed) {
  const intro = TIMING.starIntro
  const progress = clamp((elapsed - intro.burstAt) / intro.burstDuration)
  const traveled = easeOutQuart(progress)
  ctx.globalCompositeOperation = 'lighter'

  for (const star of stars) {
    const offsetX = Math.cos(star.burstAngle) * star.burstOffset * width
    const offsetY = Math.sin(star.burstAngle) * star.burstOffset * height
    const distance = star.burstSpeed * traveled
    const x = width * 0.5 + offsetX + Math.cos(star.burstAngle) * width * distance
    const y =
      height * 0.44 +
      offsetY +
      Math.sin(star.burstAngle) * height * distance +
      progress * progress * height * 0.16
    const tail = (24 + traveled * 180) * (width < 700 ? 0.7 : 1)
    const tailX = x - Math.cos(star.burstAngle) * tail
    const tailY = y - Math.sin(star.burstAngle) * tail
    const alpha = star.alpha * (1 - progress * 0.25)

    ctx.globalAlpha = alpha * 0.55
    ctx.strokeStyle =
      star.colorIndex === 1
        ? 'rgba(206, 220, 245, 0.75)'
        : star.colorIndex === 2
          ? 'rgba(238, 204, 218, 0.72)'
          : 'rgba(248, 240, 228, 0.75)'
    ctx.lineWidth = star.size * 0.62
    ctx.beginPath()
    ctx.moveTo(tailX, tailY)
    ctx.lineTo(x, y)
    ctx.stroke()

    drawGlow(x, y, star.size * 1.25, alpha, star.colorIndex)
  }
}

function drawWarp(elapsed) {
  const intro = TIMING.starIntro
  const progress = clamp((elapsed - intro.warpAt) / intro.warpDuration)
  const eased = progress * progress
  const centerX = width * 0.5
  const centerY = height * 0.47
  const maxRadius = Math.hypot(width, height) * 0.62
  const fadeAtEnd = progress > 0.86 ? clamp((1 - progress) / 0.14) : 1

  ctx.globalCompositeOperation = 'lighter'

  const core = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.24)
  core.addColorStop(0, `rgba(255, 249, 239, ${0.2 + progress * 0.34})`)
  core.addColorStop(0.16, 'rgba(213, 220, 246, 0.18)')
  core.addColorStop(0.6, 'rgba(187, 198, 236, 0.04)')
  core.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = core
  ctx.globalAlpha = 1
  ctx.fillRect(0, 0, width, height)

  for (const seed of warpSeeds) {
    const distanceFactor = seed.offset + eased * seed.speed
    const startRadius = distanceFactor * maxRadius
    const streakLength =
      (26 + eased * 320 * seed.length + seed.speed * 32) * fadeAtEnd
    const alpha =
      seed.alpha *
      Math.sin(Math.PI * clamp(progress * 0.92 + 0.08)) *
      (0.45 + eased * 0.7) *
      fadeAtEnd
    if (startRadius > maxRadius) continue

    const x1 = centerX + Math.cos(seed.angle) * startRadius
    const y1 = centerY + Math.sin(seed.angle) * startRadius
    const x2 = centerX + Math.cos(seed.angle) * (startRadius + streakLength)
    const y2 = centerY + Math.sin(seed.angle) * (startRadius + streakLength)

    ctx.globalAlpha = alpha * 0.9
    ctx.strokeStyle =
      seed.colorIndex === 1
        ? 'rgba(199, 214, 242, 0.9)'
        : seed.colorIndex === 2
          ? 'rgba(233, 201, 216, 0.82)'
          : seed.colorIndex === 3
            ? 'rgba(237, 218, 181, 0.84)'
            : 'rgba(246, 239, 230, 0.9)'
    ctx.lineWidth = 0.8 + eased * 1.7
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    drawGlow(x1, y1, 1.3 + eased * 1.2, alpha, seed.colorIndex)
  }
}

function nearDate(normalizedPoint, padding = 0.05) {
  return pointInsideBounds(normalizedPoint, dateBounds, padding)
}

function showHiddenDate(duration = TIMING.star.dateRevealMs) {
  if (!datePoints.length) return
  dateHasAppeared.value = true
  dateRevealUntil = performance.now() + duration
  if (dateHideTimer) clearTimeout(dateHideTimer)
  dateHideTimer = setTimeout(() => {
    dateHasAppeared.value = false
    dateRevealUntil = 0
    dateHideTimer = null
  }, duration)
}

function drawDate(now, alphaMultiplier = 1) {
  if (!datePoints.length || !dateHasAppeared.value) return

  let baseAlpha = introPhase.value === 'home' ? 0.25 : 0.17
  let nearBoost = 0
  let flashBoost = 0

  const cameraHand =
    gestureApi?.live.palm.present && gestureApi.gesture.value === 'openPalm'
  const manualHand = props.manualMode && pointer.present
  const openHandActive = cameraHand || manualHand
  const handPoint = cameraHand
    ? { x: gestureApi.live.palm.x, y: gestureApi.live.palm.y }
    : pointer

  if (openHandActive && nearDate(handPoint, 0.055)) {
    nearBoost = 1
  }

  if (journey.triggering) {
    const elapsed = now - triggerStartedAt
    const period = TIMING.starIntro.dateFlashDuration
    const slot = Math.floor(elapsed / period)
    if (slot < TIMING.starIntro.dateFlashCount) {
      const inside = (elapsed % period) / period
      flashBoost = inside < 0.54 ? 1 : 0.14
    }
  }

  if (now < dateRevealUntil) {
    flashBoost = Math.max(flashBoost, 0.9)
  }

  baseAlpha += nearBoost * 0.36 + flashBoost * 0.72
  baseAlpha *= alphaMultiplier * (quietMode.value ? 0.7 : 1)
  baseAlpha = clamp(baseAlpha, 0, 1)

  if (baseAlpha > 0.35 && dateBounds) {
    const cx = dateBounds.centerX * width
    const cy = dateBounds.centerY * height
    const radius = Math.max(width * 0.24, (dateBounds.right - dateBounds.left) * width * 0.72)
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    halo.addColorStop(0, `rgba(238, 218, 181, ${0.1 * baseAlpha})`)
    halo.addColorStop(0.45, `rgba(218, 211, 237, ${0.05 * baseAlpha})`)
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = halo
    ctx.globalAlpha = 1
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
  }

  ctx.globalCompositeOperation = 'lighter'
  const flash = flashBoost > 0.7
  for (const point of datePoints) {
    const twinkle = 0.6 + 0.4 * Math.sin(now * 0.0015 + point.phase)
    drawGlow(
      point.nx * width,
      point.ny * height,
      (flash ? 1.9 : 1.38) * point.jitter,
      baseAlpha * twinkle,
      3,
    )
  }
}

function updateTrail(dt) {
  for (let index = trail.length - 1; index >= 0; index -= 1) {
    const particle = trail[index]
    particle.life -= dt * 1000 / particle.lifeSpan
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt
    if (particle.life <= 0) trail.splice(index, 1)
  }

  ctx.globalCompositeOperation = 'lighter'
  for (const particle of trail) {
    drawGlow(
      particle.x,
      particle.y,
      particle.size * clamp(particle.life, 0, 1),
      particle.life * particle.alpha,
      particle.colorIndex,
    )
  }
}

function addTrail(x, y, count = 1, energy = 1) {
  for (let i = 0; i < count; i += 1) {
    trail.push({
      x: x + rand(-9, 9),
      y: y + rand(-9, 9),
      vx: rand(-7, 7),
      vy: rand(-9, 4),
      size: rand(0.7, 2.2) * energy,
      alpha: rand(0.22, 0.7),
      life: 1,
      lifeSpan: rand(420, TIMING.star.trailLife + 180),
      colorIndex: randInt(0, 4),
    })
  }
  if (trail.length > 260) trail.splice(0, trail.length - 260)
}

function spawnFireworks(x, y, count = 76, power = 1) {
  for (let i = 0; i < count; i += 1) {
    const angle = rand(0, Math.PI * 2)
    const speed = rand(28, 175) * power
    const life = rand(0.55, 1.35)
    fireworks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - rand(8, 30) * power,
      gravity: rand(14, 45),
      life,
      maxLife: life,
      size: rand(0.7, 2.1),
      colorIndex: randInt(0, 4),
      sparkle: Math.random() > 0.6,
    })
  }
}

function updateFireworks(dt) {
  ctx.globalCompositeOperation = 'lighter'
  for (let index = fireworks.length - 1; index >= 0; index -= 1) {
    const particle = fireworks[index]
    particle.life -= dt
    if (particle.life <= 0) {
      fireworks.splice(index, 1)
      continue
    }
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt
    particle.vy += particle.gravity * dt
    particle.vx *= 0.985
    const alpha = clamp(particle.life / particle.maxLife)
    const size = particle.size * (0.55 + alpha * 0.8)
    if (particle.sparkle && Math.random() > 0.45) {
      drawGlow(particle.x, particle.y, size * 1.9, alpha * 0.9, particle.colorIndex)
    } else {
      ctx.globalAlpha = alpha * 0.55
      ctx.fillStyle =
        particle.colorIndex === 1
          ? 'rgba(201, 218, 245, 0.9)'
          : particle.colorIndex === 2
            ? 'rgba(238, 202, 217, 0.9)'
            : 'rgba(245, 230, 203, 0.92)'
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function spawnHeartBurst(x, y, count = 34, power = 1) {
  for (let i = 0; i < count; i += 1) {
    const angle = rand(0, Math.PI * 2)
    const speed = rand(32, 128) * power
    const life = rand(1.1, 2.1)
    heartParticles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - rand(10, 38),
      gravity: rand(10, 30),
      life,
      maxLife: life,
      size: rand(4, 10),
      rotation: rand(-0.6, 0.6),
      spin: rand(-1.3, 1.3),
      colorIndex: randInt(0, 4),
      kind: 'heart',
    })
  }
}

function spawnHeartRain(count = 46) {
  for (let i = 0; i < count; i += 1) {
    const life = rand(3.4, 5.4)
    heartParticles.push({
      x: rand(width * 0.08, width * 0.92),
      y: rand(-height * 0.15, height * 0.18),
      vx: rand(-12, 12),
      vy: rand(28, 70),
      gravity: rand(3, 8),
      life,
      maxLife: life,
      size: rand(4, 11),
      rotation: rand(-0.4, 0.4),
      spin: rand(-0.6, 0.6),
      colorIndex: randInt(0, 4),
      kind: 'heart',
    })
  }
}

function drawHeartShape(x, y, size, rotation, alpha, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, size * 0.42)
  ctx.bezierCurveTo(-size * 1.38, -size * 0.3, -size * 0.48, -size * 1.18, 0, -size * 0.36)
  ctx.bezierCurveTo(size * 0.48, -size * 1.18, size * 1.38, -size * 0.3, 0, size * 0.42)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function updateHeartParticles(dt) {
  const colors = [
    'rgba(255, 244, 229, 0.9)',
    'rgba(239, 190, 207, 0.88)',
    'rgba(218, 194, 232, 0.82)',
    'rgba(247, 218, 188, 0.88)',
    'rgba(234, 178, 192, 0.82)',
  ]
  ctx.globalCompositeOperation = 'lighter'
  for (let index = heartParticles.length - 1; index >= 0; index -= 1) {
    const particle = heartParticles[index]
    particle.life -= dt
    if (particle.life <= 0) {
      heartParticles.splice(index, 1)
      continue
    }
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt
    particle.vy += particle.gravity * dt
    particle.vx *= 0.988
    particle.rotation += particle.spin * dt
    const alpha = clamp(particle.life / particle.maxLife) * 0.7
    drawGlow(particle.x, particle.y, particle.size * 0.75, alpha * 0.38, particle.colorIndex)
    drawHeartShape(
      particle.x,
      particle.y,
      particle.size,
      particle.rotation,
      alpha,
      colors[particle.colorIndex],
    )
  }
}

function drawOrb(x, y, intensity = 1) {
  const radius = TIMING.star.fistOrbRadius * (0.82 + 0.12 * Math.sin(performance.now() * 0.004))
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, `rgba(255, 250, 239, ${0.72 * intensity})`)
  gradient.addColorStop(0.17, `rgba(238, 225, 207, ${0.35 * intensity})`)
  gradient.addColorStop(0.42, `rgba(203, 213, 240, ${0.15 * intensity})`)
  gradient.addColorStop(1, 'rgba(186, 195, 231, 0)')
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = 1
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = 0.4 * intensity
  ctx.strokeStyle = 'rgba(249, 237, 218, 0.5)'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.arc(x, y, radius * 0.32, 0, Math.PI * 2)
  ctx.stroke()
}

function drawHome(now) {
  const reveal = easeOutCubic(clamp((now - homeRevealAt) / 1300))
  const quiet = quietMode.value
  const speedFactor = quiet ? TIMING.star.quietSpeed : 1
  ambientClock += (now - lastFrameAt) * speedFactor
  const alphaFactor = reveal * (quiet ? TIMING.star.quietAlpha : 1)

  const cameraPalm = gestureApi?.live.palm
  const cameraOpen =
    cameraPalm?.present && gestureApi?.gesture.value === 'openPalm'
  const cameraFist = cameraPalm?.present && gestureApi?.gesture.value === 'fist'
  const manualOpen = props.manualMode && pointer.present
  const manualFist = manualFistActive.value
  const fistActive = cameraFist || manualFist
  const openActive = cameraOpen || (manualOpen && !fistActive)

  const hand = cameraFist || cameraOpen
    ? { x: cameraPalm.x, y: cameraPalm.y }
    : manualFistPoint && manualFist
      ? manualFistPoint
      : { x: pointer.x, y: pointer.y }
  const handPresent =
    cameraOpen || cameraFist || (manualOpen && pointer.present) || manualFist
  const handX = hand.x * width
  const handY = hand.y * height

  let fistNearDate = false
  if (fistActive && handPresent && dateExploreEnabled.value) {
    if (now > nextDateRevealAt && nearDate(hand, 0.055)) {
      showHiddenDate(TIMING.star.dateRevealMs)
      nextDateRevealAt = now + TIMING.star.dateRevealMs + 350
      fistNearDate = true
      spawnFireworks(handX, handY, 32, 0.65)
    }
  } else {
    nextDateRevealAt = 0
  }

  if (openActive && handPresent && dateExploreEnabled.value && nearDate(hand, 0.055)) {
    showHiddenDate(TIMING.star.dateRevealMs)
  }

  const palmRadius = quiet
    ? TIMING.star.palmRadius * 0.7
    : TIMING.star.palmRadius
  const fistRadius = quiet
    ? TIMING.star.fistOrbRadius * 2.4
    : TIMING.star.fistOrbRadius * 3.2

  ctx.globalCompositeOperation = 'lighter'

  if (handPresent) {
    const radius = openActive ? palmRadius * 0.9 : 150
    const aura = ctx.createRadialGradient(handX, handY, 0, handX, handY, radius)
    aura.addColorStop(
      0,
      `rgba(255, 248, 234, ${openActive ? 0.16 : 0.1})`,
    )
    aura.addColorStop(0.3, 'rgba(227, 210, 238, 0.07)')
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = aura
    ctx.globalAlpha = 1
    ctx.fillRect(handX - radius, handY - radius, radius * 2, radius * 2)
  }

  for (const star of stars) {
    const baseX =
      star.nx * width +
      Math.sin(ambientClock * 0.001 * star.driftSpeed + star.phase) * star.drift
    const baseY =
      star.ny * height +
      Math.cos(ambientClock * 0.0008 * star.driftSpeed + star.phase * 1.3) *
        star.drift *
        0.6

    let targetOffsetX = 0
    let targetOffsetY = 0
    if (handPresent) {
      const dx = handX - baseX
      const dy = handY - baseY
      const dist = Math.hypot(dx, dy)
      if (openActive && dist < palmRadius) {
        const falloff = (1 - dist / palmRadius) ** 1.55
        targetOffsetX = dx * falloff * 0.76
        targetOffsetY = dy * falloff * 0.76
      } else if (fistActive && dist < fistRadius) {
        const falloff = (1 - dist / fistRadius) ** 1.2
        targetOffsetX = dx * falloff * 0.94
        targetOffsetY = dy * falloff * 0.94
      }
    }

    const spring = 1 - (1 - 0.075) ** ((now - lastFrameAt) / 16.67)
    star.ox += (targetOffsetX - star.ox) * clamp(spring, 0.02, 0.3)
    star.oy += (targetOffsetY - star.oy) * clamp(spring, 0.02, 0.3)

    const twinkle = twinkleOf(star, ambientClock)
    const handDistance = handPresent ? distTo(star, handX, handY) : Infinity
    const proximity = handDistance < palmRadius ? 1.38 : 1
    drawGlow(
      baseX + star.ox,
      baseY + star.oy,
      star.size * (fistActive ? 1.02 : 1.08),
      star.alpha * alphaFactor * (0.58 + twinkle * 0.62) * proximity,
      star.colorIndex,
    )

    if (openActive && handDistance < palmRadius * 1.2) {
      drawGlow(
        baseX + star.ox,
        baseY + star.oy,
        star.size * 2.1,
        star.alpha * alphaFactor * 0.18,
        3,
      )
    }
  }

  if (handPresent && (openActive || fistActive)) {
    if (now - lastTrailAt > 24) {
      addTrail(handX, handY, fistActive ? 1 : 3, fistActive ? 0.8 : 1.25)
      lastTrailAt = now
    }
  }

  if (manualOpen && pointer.present && now - lastTrailAt > 60) {
    addTrail(pointer.x * width, pointer.y * height, 2, 1)
    lastTrailAt = now
  }

  if (fistActive && handPresent) {
    drawOrb(handX, handY, fistNearDate ? 1.25 : 1)
  }

  drawDate(now, alphaFactor)

  if (quiet) {
    ctx.globalCompositeOperation = 'lighter'
    const glow = ctx.createRadialGradient(
      width / 2,
      height * 0.5,
      0,
      width / 2,
      height * 0.5,
      Math.min(width, height) * 0.65,
    )
    glow.addColorStop(0, 'rgba(126, 137, 182, 0.025)')
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = glow
    ctx.globalAlpha = 1
    ctx.fillRect(0, 0, width, height)
  }
}

function distTo(star, x, y) {
  return Math.hypot(star.nx * width - x, star.ny * height - y)
}

function syncPhase(now, elapsed) {
  const intro = TIMING.starIntro
  let phase = 'emerge'
  if (elapsed >= intro.homeAt) phase = 'home'
  else if (elapsed >= intro.warpAt) phase = 'warp'
  else if (elapsed >= intro.burstAt) phase = 'burst'
  else if (elapsed >= intro.gatherAt) phase = 'gather'

  if (phase === introPhase.value) return

  const previous = introPhase.value
  introPhase.value = phase

  if (phase === 'burst') prepareBurst()
  if (phase === 'warp') createWarpSeeds()
  if (phase === 'home') {
    homeRevealAt = now
    ambientClock = 0
    for (const star of stars) {
      star.ox = 0
      star.oy = 0
    }
    if (previous === 'warp') {
      landingFlash.value = true
      later(() => {
        landingFlash.value = false
      }, 1500)
    }
  }
}

function render(now) {
  if (!ctx) return
  const dt = Math.min(0.05, (now - lastFrameAt) / 1000 || 0.016)
  const elapsed = now - startAt
  syncPhase(now, elapsed)

  ctx.clearRect(0, 0, width, height)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'

  if (introPhase.value === 'emerge') drawEmerge(now, elapsed)
  else if (introPhase.value === 'gather') drawGather(now, elapsed)
  else if (introPhase.value === 'burst') {
    drawBurst(elapsed)
    drawDate(now, 0.9)
  } else if (introPhase.value === 'warp') {
    drawWarp(elapsed)
  } else if (introPhase.value === 'home') {
    drawHome(now)
  }

  if (introPhase.value !== 'warp') {
    updateTrail(dt)
    updateFireworks(dt)
    updateHeartParticles(dt)
  }

  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  lastFrameAt = now
  rafHandle = requestAnimationFrame(render)
}

function beginJourney(source = 'gesture') {
  if (!canAdvance.value || journey.triggering) return
  journey.triggering = true
  triggerStartedAt = performance.now()
  flashPlaying.value = true
  later(() => {
    flashPlaying.value = false
  }, TIMING.starIntro.triggerFlash)

  if (source === 'gesture') {
    const point = gestureApi?.live.palm
    if (point?.present) addTrail(point.x * width, point.y * height, 18, 1.6)
  }

  later(() => {
    journey.bubble = true
  }, TIMING.starIntro.bubbleDelay)

  later(() => {
    journey.departing = true
    journey.bubble = false
    later(() => {
      emit('warp-out')
    }, TIMING.starIntro.warpOutDelay)
  }, TIMING.starIntro.bubbleDelay + TIMING.starIntro.bubbleHold)
}

function updatePointer(event) {
  if (!props.manualMode) return
  const rect = sceneEl.value?.getBoundingClientRect()
  if (!rect) return
  pointer.x = clamp((event.clientX - rect.left) / rect.width, 0, 1)
  pointer.y = clamp((event.clientY - rect.top) / rect.height, 0, 1)
  pointer.present = true
  if (introPhase.value === 'home') {
    addTrail(pointer.x * width, pointer.y * height, 1, 0.8)
    if (
      dateExploreEnabled.value &&
      nearDate(pointer, 0.07) &&
      performance.now() > nextDateRevealAt
    ) {
      showHiddenDate(900)
      nextDateRevealAt = performance.now() + 300
    }
  }
}

function clearPointer() {
  pointer.present = false
}

function getFallbackPoint() {
  if (pointer.present) return { x: pointer.x, y: pointer.y }
  if (dateBounds) {
    return { x: dateBounds.centerX, y: dateBounds.centerY }
  }
  return { x: 0.5, y: 0.36 }
}

function fallbackFist() {
  if (!canAdvance.value) return
  const point = getFallbackPoint()
  manualFistPoint = point
  manualFistActive.value = true
  fistPulse.value = true
  if (manualFistTimer) clearTimeout(manualFistTimer)
  manualFistTimer = setTimeout(() => {
    manualFistActive.value = false
    fistPulse.value = false
  }, 1700)
  if (nearDate(point, 0.055) && dateExploreEnabled.value) {
    showHiddenDate(TIMING.star.dateRevealMs)
  }
}

function fallbackThumbsUp() {
  if (!canAdvance.value) return
  const point = getFallbackPoint()
  const now = performance.now()
  if (now - lastThumbAt < TIMING.star.thumbCooldown) return
  lastThumbAt = now
  spawnFireworks(point.x * width, point.y * height, 84, 1)
}

function heartPoint() {
  const palm = gestureApi?.live.palm
  if (palm?.present) return { x: palm.x * width, y: palm.y * height }
  if (props.manualMode && pointer.present) {
    return { x: pointer.x * width, y: pointer.y * height }
  }
  return { x: width * 0.5, y: height * 0.42 }
}

function triggerOkEffect(source = 'gesture') {
  if (introPhase.value !== 'home' || !canAdvance.value) return
  const now = performance.now()
  if (now - lastHeartAt < 650) return
  lastHeartAt = now
  const point = heartPoint()
  okPulse.value = source === 'manual'
  spawnHeartBurst(point.x, point.y, 48, 1)
  spawnFireworks(point.x, point.y, 22, 0.55)
  setTimeout(() => {
    okPulse.value = false
  }, 900)
}

function triggerLoveEffect(source = 'gesture') {
  if (introPhase.value !== 'home' || !canAdvance.value) return
  const now = performance.now()
  if (now - lastHeartAt < 900) return
  lastHeartAt = now
  const point = heartPoint()
  lovePulse.value = source === 'manual'
  spawnHeartRain(54)
  spawnHeartBurst(point.x, point.y, 22, 0.8)
  setTimeout(() => {
    lovePulse.value = false
  }, 1100)
}

function toggleQuiet() {
  if (!canAdvance.value) return
  manualQuiet.value = !manualQuiet.value
}

function handleThumbUp() {
  if (introPhase.value !== 'home' || !canAdvance.value) return
  const now = performance.now()
  if (now - lastThumbAt < TIMING.star.thumbCooldown) return
  lastThumbAt = now
  const palm = gestureApi?.live.palm
  const x = palm?.present ? palm.x * width : width * 0.5
  const y = palm?.present ? palm.y * height : height * 0.4
  spawnFireworks(x, y, 92, 1.05)
}

if (gestureApi) {
  watch(
    gestureApi.gesture,
    (name) => {
      if (name === 'scissors' && canAdvance.value && !journey.triggering) {
        beginJourney('gesture')
      }
    },
    { flush: 'post' },
  )

  watch(
    () => gestureApi.lastGesture.value.id,
    () => {
      const event = gestureApi.lastGesture.value
      if (event?.name === 'thumbsUp') handleThumbUp()
      else if (event?.name === 'ok') triggerOkEffect('gesture')
      else if (event?.name === 'loveYou') triggerLoveEffect('gesture')
    },
    { flush: 'post' },
  )

  // 如果用户在提示出现前就保持着剪刀手，ready 后也补触发一次。
  watch(canAdvance, (ready) => {
    if (ready && gestureApi.gesture.value === 'scissors' && !journey.triggering) {
      beginJourney('gesture')
    }
  })
}

function handleTimelineComplete() {
  if (showEarth.value) return
  const {
    datePreviewDuration,
    earthRevealAfterDate,
    whispersDelayAfterEarth,
    welcomeDelayAfterEarth,
    readyDelayAfterWelcome,
  } = TIMING.starIntro

  // 九颗星定格后，先把藏在星空里的日期亮一下，再隐藏。
  showHiddenDate(datePreviewDuration)

  later(() => {
    showEarth.value = true
    dateExploreEnabled.value = true

    // 地球出现后，会说话的漂浮音符逐个进场。
    later(() => {
      showWhispers.value = true
    }, whispersDelayAfterEarth)

    // 欢迎文案最后才出现，并按行慢慢淡入。
    later(() => {
      showWelcome.value = true
    }, welcomeDelayAfterEarth)

    later(() => {
      canAdvance.value = true
    }, welcomeDelayAfterEarth + readyDelayAfterWelcome)
  }, datePreviewDuration + earthRevealAfterDate)
}

onMounted(() => {
  startAt = performance.now()
  lastFrameAt = startAt
  buildSprites()
  resize()
  observer = new ResizeObserver(() => resize())
  if (sceneEl.value) observer.observe(sceneEl.value)
  rafHandle = requestAnimationFrame(render)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafHandle)
  observer?.disconnect()
  if (dateHideTimer) clearTimeout(dateHideTimer)
  clearTimers()
})
</script>

<template>
  <section
    ref="sceneEl"
    class="star-scene"
    :class="[
      phaseClass,
      {
        'is-quiet': quietMode,
        'is-triggering': journey.triggering,
        'is-departing': journey.departing,
      },
    ]"
    @pointermove="updatePointer"
    @pointerdown="updatePointer"
    @pointerleave="clearPointer"
  >
    <div class="star-wash" aria-hidden="true"></div>
    <CelestialDecor />
    <canvas ref="canvasEl" class="star-canvas" aria-hidden="true"></canvas>
    <div
      class="warp-rings"
      :class="{ active: introPhase === 'warp' || journey.departing }"
      aria-hidden="true"
    >
      <span class="warp-vortex"></span>
      <span class="ring ring-a"></span>
      <span class="ring ring-b"></span>
      <span class="ring ring-c"></span>
      <span class="ring ring-d"></span>
      <span class="ring ring-e"></span>
      <span class="warp-core"></span>
    </div>

    <MotifField
      :active="introPhase === 'warp' || introPhase === 'home'"
      :intense="introPhase === 'warp'"
    />

    <div class="scene-vignette" aria-hidden="true"></div>
    <div class="trigger-flash" :class="{ play: flashPlaying }" aria-hidden="true"></div>
    <div class="landing-flash" :class="{ play: landingFlash }" aria-hidden="true"></div>

    <MemoryTimeline
      v-if="introPhase === 'home' && !journey.departing"
      :dimmed="showEarth"
      @complete="handleTimelineComplete"
    />
    <EarthJourney v-if="showEarth && !journey.departing" />
    <StarWhispers v-if="showWhispers && !journey.triggering" :active="true" />

    <Transition name="soft-rise">
      <div v-if="showWelcome && !journey.departing" class="star-copy">
        <p class="welcome-line welcome-copy-one">{{ COPY.welcomeLine1 }}</p>
        <p class="welcome-sub welcome-copy-two">{{ COPY.welcomeLine2 }}</p>
        <span class="welcome-divider welcome-copy-divider" aria-hidden="true">
          <i></i><b>✦</b><i></i>
        </span>
        <p class="star-hint welcome-copy-three">{{ COPY.starHint }}</p>
        <p class="whisper-line welcome-copy-four">✦ {{ COPY.whisperHint }}</p>
        <div v-if="canAdvance" class="advance-row welcome-copy-five">
          <button type="button" class="advance-button" @click="beginJourney('pointer')">
            {{ advanceLabel }}
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="bubble">
      <div v-if="journey.bubble && !journey.departing" class="system-bubble" role="status">
        <span class="bubble-spark" aria-hidden="true">✦</span>
        <p>{{ COPY.triggerBubble }}</p>
      </div>
    </Transition>

    <Transition name="quiet">
      <div v-if="quietMode && introPhase === 'home'" class="quiet-badge">
        <span class="quiet-dot"></span>
        {{ UI.star.quiet }}
      </div>
    </Transition>

    <Transition name="fallback-dock">
      <div
        v-if="manualMode && canAdvance && !journey.triggering"
        class="fallback-dock"
        :class="{ 'is-open': fallbackOpen }"
        :aria-label="UI.star.fallbackPanel"
      >
        <button
          type="button"
          class="fallback-toggle"
          :aria-expanded="fallbackOpen"
          :title="UI.star.fallbackPanel"
          @click.stop="fallbackOpen = !fallbackOpen"
        >
          <span class="fallback-toggle-icon" aria-hidden="true">✦</span>
          <span class="fallback-toggle-label">{{ UI.star.fallbackLabel }}</span>
        </button>

        <Transition name="fallback-actions">
          <div v-if="fallbackOpen" class="fallback-actions">
            <button
              type="button"
              class="fallback-action"
              :class="{ active: fistPulse }"
              :title="UI.star.fistHint"
              :aria-label="UI.star.fistAria"
              @click.stop="fallbackFist"
            >
              <span class="fallback-icon" aria-hidden="true">✊</span>
              <span class="fallback-label">{{ UI.star.fist }}</span>
            </button>
            <button
              type="button"
              class="fallback-action"
              :title="UI.star.fireworksHint"
              :aria-label="UI.star.fireworksAria"
              @click.stop="fallbackThumbsUp"
            >
              <span class="fallback-icon" aria-hidden="true">👍</span>
              <span class="fallback-label">{{ UI.star.fireworks }}</span>
            </button>
            <button
              type="button"
              class="fallback-action"
              :class="{ active: okPulse }"
              :title="UI.star.okHint"
              :aria-label="UI.star.okAria"
              @click.stop="triggerOkEffect('manual')"
            >
              <span class="fallback-icon" aria-hidden="true">👌</span>
              <span class="fallback-label">{{ UI.star.ok }}</span>
            </button>
            <button
              type="button"
              class="fallback-action"
              :class="{ active: lovePulse }"
              :title="UI.star.loveHint"
              :aria-label="UI.star.loveAria"
              @click.stop="triggerLoveEffect('manual')"
            >
              <span class="fallback-icon" aria-hidden="true">🤟</span>
              <span class="fallback-label">{{ UI.star.love }}</span>
            </button>
            <button
              type="button"
              class="fallback-action"
              :class="{ active: manualQuiet }"
              :title="UI.star.quietHint"
              :aria-label="UI.star.quietAria"
              @click.stop="toggleQuiet"
            >
              <span class="fallback-icon" aria-hidden="true">🫶</span>
              <span class="fallback-label">{{ UI.star.quietShort }}</span>
            </button>
          </div>
        </Transition>
      </div>
    </Transition>

  </section>
</template>

<style scoped>
.star-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse 95% 75% at 50% 42%, rgba(25, 29, 53, 0.62), transparent 70%),
    radial-gradient(ellipse 65% 50% at 18% 16%, rgba(67, 55, 84, 0.18), transparent 70%),
    radial-gradient(ellipse 55% 50% at 86% 72%, rgba(45, 56, 92, 0.2), transparent 70%),
    linear-gradient(180deg, #05060d 0%, #080a14 48%, #0b0d18 100%);
  cursor: default;
  touch-action: none;
}

.star-wash {
  position: absolute;
  inset: -15%;
  pointer-events: none;
  opacity: 0.55;
  background:
    radial-gradient(ellipse 28% 20% at 64% 38%, rgba(158, 165, 205, 0.055), transparent 70%),
    radial-gradient(ellipse 38% 26% at 34% 61%, rgba(201, 160, 181, 0.035), transparent 72%);
  filter: blur(18px);
  animation: wash-breathe 18s ease-in-out infinite alternate;
}

.star-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.scene-vignette {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background:
    radial-gradient(ellipse 68% 62% at 50% 48%, transparent 34%, rgba(3, 4, 10, 0.26) 100%),
    linear-gradient(180deg, rgba(3, 4, 10, 0.38), transparent 18%, transparent 78%, rgba(3, 4, 10, 0.46));
}

.star-copy {
  position: absolute;
  left: 50%;
  bottom: clamp(22px, 4.5vh, 46px);
  z-index: 12;
  width: min(720px, 88vw);
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;
}

.welcome-line {
  margin: 0;
  color: rgba(249, 241, 231, 0.92);
  font-family: var(--font-display);
  font-size: clamp(21px, 2.9vw, 35px);
  font-weight: 400;
  letter-spacing: 0.12em;
  line-height: 1.9;
  text-shadow:
    0 0 26px rgba(238, 226, 214, 0.22),
    0 0 60px rgba(179, 192, 229, 0.12);
}

.welcome-sub {
  margin: 6px 0 0;
  color: rgba(233, 226, 221, 0.64);
  font-size: clamp(12px, 1.35vw, 15px);
  letter-spacing: 0.18em;
  line-height: 1.8;
}

.star-hint {
  margin: clamp(20px, 3vh, 30px) 0 0;
  color: rgba(221, 218, 224, 0.46);
  font-size: clamp(11px, 1.15vw, 13px);
  letter-spacing: 0.08em;
  line-height: 1.8;
}

.advance-row {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  pointer-events: auto;
}

.advance-button {
  padding: 9px 18px;
  border: 1px solid rgba(238, 226, 213, 0.15);
  border-radius: 999px;
  background: rgba(248, 240, 230, 0.045);
  color: rgba(241, 232, 223, 0.58);
  font-size: 12px;
  letter-spacing: 0.08em;
  transition:
    color 0.4s ease,
    border-color 0.4s ease,
    background 0.4s ease,
    transform 0.4s ease;
}

.advance-button:hover {
  color: rgba(251, 242, 232, 0.92);
  border-color: rgba(238, 226, 213, 0.3);
  background: rgba(248, 240, 230, 0.09);
  transform: translateY(-1px);
}

.welcome-copy-one,
.welcome-copy-two,
.welcome-copy-divider,
.welcome-copy-three,
.welcome-copy-four,
.welcome-copy-five {
  opacity: 0;
  animation: welcome-copy-in 1.55s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

.welcome-copy-one {
  animation-delay: 0.25s;
}

.welcome-copy-two {
  animation-delay: 1.15s;
}

.welcome-copy-divider {
  animation-delay: 1.85s;
}

.welcome-copy-three {
  animation-delay: 2.6s;
}

.welcome-copy-four {
  animation-delay: 3.4s;
}

.welcome-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: min(350px, 60vw);
  margin: 12px auto 0;
  color: rgba(231, 214, 193, 0.45);
}

.welcome-divider i {
  display: block;
  width: 58px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(231, 214, 193, 0.42));
}

.welcome-divider i:last-child {
  background: linear-gradient(90deg, rgba(231, 214, 193, 0.42), transparent);
}

.welcome-divider b {
  color: rgba(242, 220, 187, 0.65);
  font-size: 8px;
  font-weight: 400;
}

.welcome-copy-five {
  animation-delay: 0.2s;
  animation-duration: 1.2s;
}

@keyframes welcome-copy-in {
  from {
    opacity: 0;
    transform: translateY(9px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.system-bubble {
  position: absolute;
  left: 50%;
  top: 52%;
  z-index: 18;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: min(550px, 86vw);
  transform: translate(-50%, -50%);
  padding: 19px 26px 20px 22px;
  border: 1px solid rgba(255, 250, 244, 0.45);
  border-radius: 26px 26px 26px 8px;
  background:
    linear-gradient(135deg, rgba(255, 250, 244, 0.95), rgba(244, 234, 222, 0.9));
  box-shadow:
    0 20px 70px rgba(0, 0, 0, 0.26),
    inset 0 0 35px rgba(255, 255, 255, 0.3);
  color: #514950;
  backdrop-filter: blur(16px);
}

.system-bubble::before {
  content: '';
  position: absolute;
  left: 28px;
  bottom: -10px;
  width: 18px;
  height: 18px;
  background: rgba(250, 243, 234, 0.94);
  border-right: 1px solid rgba(255, 250, 244, 0.3);
  border-bottom: 1px solid rgba(255, 250, 244, 0.3);
  transform: rotate(45deg);
  border-radius: 0 0 6px 0;
}

.system-bubble p {
  margin: 0;
  font-size: clamp(14px, 1.6vw, 17px);
  letter-spacing: 0.05em;
  line-height: 1.9;
}

.bubble-spark {
  flex: 0 0 auto;
  margin-top: 2px;
  color: #c2a879;
  font-size: 18px;
}

.quiet-badge {
  position: absolute;
  top: calc(86px + env(safe-area-inset-top));
  left: 50%;
  z-index: 14;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border: 1px solid rgba(215, 222, 243, 0.14);
  border-radius: 999px;
  color: rgba(226, 228, 240, 0.62);
  background: rgba(18, 21, 37, 0.4);
  font-size: 11px;
  letter-spacing: 0.09em;
  backdrop-filter: blur(10px);
}

.quiet-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #c6cee5;
  box-shadow: 0 0 12px rgba(196, 207, 236, 0.8);
}

.trigger-flash {
  position: absolute;
  inset: 0;
  z-index: 15;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(
    circle at 50% 45%,
    rgba(255, 249, 237, 0.44),
    rgba(217, 223, 245, 0.08) 42%,
    transparent 70%
  );
}

.trigger-flash.play {
  animation: trigger-soft-flash 0.55s ease-out both;
}

.landing-flash {
  position: absolute;
  inset: 0;
  z-index: 9;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(
    circle at 50% 46%,
    rgba(255, 249, 240, 0.62),
    rgba(197, 209, 239, 0.12) 34%,
    transparent 68%
  );
}

.landing-flash.play {
  animation: landing-flash 1.35s ease-out both;
}

.star-scene.is-departing .star-canvas {
  animation: depart-zoom 1.35s cubic-bezier(0.3, 0.05, 0.2, 1) both;
}

.star-scene.is-departing .star-copy,
.star-scene.is-departing .quiet-badge,
.star-scene.is-departing .fallback-dock {
  opacity: 0;
  transition: opacity 0.5s ease;
}

.star-scene.is-departing .system-bubble {
  opacity: 0;
  transition: opacity 0.16s ease;
}

.star-scene.is-departing .warp-rings {
  opacity: 1;
}

.whisper-line {
  margin: 8px 0 0;
  color: rgba(220, 214, 225, 0.34);
  font-size: clamp(10px, 1vw, 11px);
  letter-spacing: 0.06em;
  line-height: 1.8;
}

.fallback-dock {
  position: absolute;
  left: clamp(14px, 2vw, 28px);
  top: 50%;
  z-index: 22;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 5px;
  border: 1px solid rgba(239, 230, 218, 0.1);
  border-radius: 20px;
  background: rgba(12, 14, 25, 0.38);
  backdrop-filter: blur(12px);
  transform: translateY(-50%);
}

.fallback-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(246, 237, 226, 0.08);
  border-radius: 13px;
  color: rgba(235, 225, 217, 0.55);
  background: rgba(246, 237, 226, 0.035);
  transition:
    color 0.3s ease,
    background 0.3s ease;
}

.fallback-toggle:hover,
.fallback-dock.is-open .fallback-toggle {
  color: rgba(252, 243, 233, 0.86);
  background: rgba(246, 237, 226, 0.09);
}

.fallback-toggle-icon {
  font-size: 10px;
  color: rgba(238, 218, 184, 0.76);
}

.fallback-toggle-label {
  font-size: 8px;
  letter-spacing: 0.07em;
  white-space: nowrap;
}

.fallback-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 4px 2px 3px;
}

.fallback-action {
  width: 52px;
  min-height: 46px;
  padding: 5px 3px 4px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: rgba(248, 240, 229, 0.74);
  background: rgba(246, 237, 226, 0.035);
  border: 1px solid transparent;
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    transform 0.3s ease;
}

.fallback-icon {
  font-size: 14px;
  line-height: 1.2;
}

.fallback-label {
  font-size: 8px;
  letter-spacing: 0.08em;
  line-height: 1.2;
}

.fallback-action:hover,
.fallback-action.active {
  background: rgba(246, 237, 226, 0.11);
  border-color: rgba(246, 237, 226, 0.16);
  transform: scale(1.04);
}

.fallback-actions-enter-active,
.fallback-actions-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fallback-actions-enter-from,
.fallback-actions-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.96);
}

.warp-rings {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.9s ease;
}

.warp-rings.active {
  opacity: 0.95;
}

.warp-vortex {
  position: absolute;
  left: 50%;
  top: 47%;
  width: 160vmax;
  height: 160vmax;
  transform: translate(-50%, -50%);
  background: repeating-conic-gradient(
    from 0deg,
    transparent 0deg 18deg,
    rgba(201, 212, 242, 0.065) 20deg,
    transparent 22deg 38deg
  );
  -webkit-mask-image: radial-gradient(
    circle,
    transparent 0%,
    transparent 12%,
    #000 29%,
    #000 51%,
    transparent 70%
  );
  mask-image: radial-gradient(
    circle,
    transparent 0%,
    transparent 12%,
    #000 29%,
    #000 51%,
    transparent 70%
  );
  filter: blur(1.2px);
  animation: vortex-spin 18s linear infinite;
}

.ring {
  position: absolute;
  left: 50%;
  top: 47%;
  border: 1px solid rgba(218, 225, 247, 0.34);
  border-radius: 50%;
  box-shadow:
    0 0 22px rgba(198, 210, 244, 0.12),
    inset 0 0 26px rgba(219, 211, 238, 0.06);
  transform: translate(-50%, -50%) scale(0.15);
  animation: tunnel-ring 2.2s ease-out infinite;
}

.ring-a {
  width: 32vmin;
  height: 32vmin;
  animation-delay: -0.15s;
}

.ring-b {
  width: 56vmin;
  height: 56vmin;
  animation-delay: -0.8s;
  border-color: rgba(234, 206, 217, 0.22);
}

.ring-c {
  width: 78vmin;
  height: 78vmin;
  animation-delay: -1.45s;
  border-color: rgba(208, 219, 242, 0.18);
}

.ring-d {
  width: 104vmin;
  height: 104vmin;
  animation-delay: -1.82s;
  border-color: rgba(221, 213, 238, 0.13);
}

.ring-e {
  width: 128vmin;
  height: 128vmin;
  animation-delay: -0.5s;
  border-color: rgba(211, 223, 242, 0.1);
}

.warp-core {
  position: absolute;
  left: 50%;
  top: 47%;
  width: 22vmin;
  height: 22vmin;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 249, 239, 0.3),
    rgba(206, 216, 244, 0.1) 45%,
    transparent 72%
  );
  filter: blur(10px);
  animation: core-pulse 2.6s ease-in-out infinite alternate;
}

.soft-rise-enter-active {
  transition:
    opacity 1.8s ease,
    transform 1.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.soft-rise-leave-active {
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.soft-rise-enter-from,
.soft-rise-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}

.bubble-enter-active {
  transition:
    opacity 0.8s ease,
    transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.bubble-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translate(-50%, -44%) scale(0.97);
}

.quiet-enter-active,
.quiet-leave-active {
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.quiet-enter-from,
.quiet-leave-to {
  opacity: 0;
  transform: translate(-50%, -5px);
}

.fallback-dock-enter-active,
.fallback-dock-leave-active {
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.fallback-dock-enter-from,
.fallback-dock-leave-to {
  opacity: 0;
  transform: translateY(calc(-50% + 12px));
}

@keyframes depart-zoom {
  0% {
    transform: scale(1);
    filter: brightness(1) blur(0);
    opacity: 1;
  }
  55% {
    filter: brightness(1.45) blur(1.4px);
  }
  100% {
    transform: scale(1.55);
    filter: brightness(1.8) blur(4px);
    opacity: 0;
  }
}

@keyframes trigger-soft-flash {
  0% {
    opacity: 0;
  }
  28% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}

@keyframes landing-flash {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 0.85;
  }
  100% {
    opacity: 0;
  }
}

@keyframes tunnel-ring {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.08);
  }
  35% {
    opacity: 0.78;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.7);
  }
}

@keyframes vortex-spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes core-pulse {
  from {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1.18);
  }
}

@keyframes wash-breathe {
  from {
    transform: scale(0.94) rotate(-2deg);
    opacity: 0.42;
  }
  to {
    transform: scale(1.06) rotate(2deg);
    opacity: 0.62;
  }
}

@media (max-width: 700px) {
  .star-copy {
    bottom: calc(18px + env(safe-area-inset-bottom));
    width: 91vw;
  }

  .welcome-line {
    font-size: clamp(19px, 5.4vw, 23px);
    letter-spacing: 0.07em;
    line-height: 1.55;
  }

  .welcome-sub {
    margin-top: 3px;
    font-size: 11px;
    letter-spacing: 0.12em;
    line-height: 1.55;
  }

  .welcome-divider {
    width: min(280px, 72vw);
    margin-top: 7px;
    gap: 5px;
  }

  .welcome-divider i {
    width: 44px;
  }

  .star-hint {
    margin-top: 10px;
    font-size: 10px;
    line-height: 1.55;
    letter-spacing: 0.04em;
  }

  .whisper-line {
    margin-top: 5px;
    font-size: 9px;
    line-height: 1.5;
  }

  .advance-row {
    margin-top: 10px;
  }

  .advance-button {
    padding: 8px 15px;
    font-size: 11px;
  }

  .system-bubble {
    top: 45%;
    padding: 16px 18px;
    border-radius: 22px 22px 22px 7px;
  }

  .fallback-dock {
    left: 10px;
    gap: 6px;
    padding: 7px 5px;
  }

  .fallback-action {
    width: 48px;
    min-height: 43px;
  }

  .quiet-badge {
    top: calc(74px + env(safe-area-inset-top));
    font-size: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .star-wash,
  .ring,
  .warp-core {
    animation-duration: 8s;
  }
}
</style>
