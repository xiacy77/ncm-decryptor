export const TAU = Math.PI * 2

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export const lerp = (from, to, amount) => from + (to - from) * amount

export const easeInOutCubic = (t) => {
  const x = clamp(t)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

export const easeOutCubic = (t) => 1 - (1 - clamp(t)) ** 3

export const easeOutQuart = (t) => 1 - (1 - clamp(t)) ** 4

export const rand = (min, max) => min + Math.random() * (max - min)

export const randInt = (min, max) => Math.floor(rand(min, max + 1))

export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  if (inMax === inMin) return outMin
  return outMin + ((clamp(value, inMin, inMax) - inMin) / (inMax - inMin)) * (outMax - outMin)
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
