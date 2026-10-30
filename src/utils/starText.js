import { FONTS } from '@/config/story'
import { rand } from '@/utils/math'

/**
 * 把文字栅格化，再从字形像素里随机采样，得到一组「由星光拼成」的点。
 * 返回的坐标均为 0-1 归一化值，方便随屏幕尺寸缩放。
 */
export function sampleStarText({
  text,
  width,
  height,
  centerYRatio = 0.34,
  maxFontRatio = 0.104,
  maxWidthRatio = 0.8,
  targetCount = 420,
}) {
  if (typeof document === 'undefined' || width <= 0 || height <= 0) {
    return { points: [], bounds: null, fontSize: 0 }
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width)
  canvas.height = Math.round(height)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { points: [], bounds: null, fontSize: 0 }

  let fontSize = Math.min(width * maxFontRatio, 108)
  ctx.font = `600 ${fontSize}px ${FONTS.date}`
  let measured = ctx.measureText(text)

  if (measured.width > width * maxWidthRatio) {
    fontSize *= (width * maxWidthRatio) / measured.width
    fontSize = Math.max(22, fontSize)
    ctx.font = `600 ${fontSize}px ${FONTS.date}`
    measured = ctx.measureText(text)
  }

  const centerX = width / 2
  const centerY = height * centerYRatio
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, centerX, centerY)

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const candidates = []
  const step = Math.max(2, Math.floor(fontSize / 30))
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      if (image[(y * canvas.width + x) * 4 + 3] > 110) {
        candidates.push({ x, y })
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (!candidates.length) return { points: [], bounds: null, fontSize }

  // Fisher-Yates 只打乱需要采样的数量，避免整屏点都进入绘制列表。
  const count = Math.min(targetCount, candidates.length)
  for (let i = 0; i < count; i += 1) {
    const j = i + Math.floor(Math.random() * (candidates.length - i))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  const points = candidates.slice(0, count).map((point) => ({
    nx: point.x / width,
    ny: point.y / height,
    jitter: rand(0.55, 1),
    phase: rand(0, Math.PI * 2),
  }))

  return {
    points,
    fontSize,
    bounds: {
      left: minX / width,
      right: maxX / width,
      top: minY / height,
      bottom: maxY / height,
      centerX: (minX + maxX) / 2 / width,
      centerY: (minY + maxY) / 2 / height,
    },
  }
}

export function pointInsideBounds(point, bounds, padding = 0) {
  if (!bounds) return false
  return (
    point.x >= bounds.left - padding &&
    point.x <= bounds.right + padding &&
    point.y >= bounds.top - padding &&
    point.y <= bounds.bottom + padding
  )
}
