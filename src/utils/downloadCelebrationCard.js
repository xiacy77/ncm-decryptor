import { CELEBRATION, UI } from '@/config/story'

const WIDTH = 1200
const HEIGHT = 1600

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function spacedText(ctx, text, x, y, spacing, align = 'center') {
  const widths = [...text].map((char) => ctx.measureText(char).width)
  const total = widths.reduce(
    (sum, width, index) => sum + width + (index ? spacing : 0),
    0,
  )
  let cursor = align === 'left' ? x : align === 'right' ? x - total : x - total / 2

  ctx.save()
  ctx.textAlign = 'left'
  ;[...text].forEach((char, index) => {
    ctx.fillText(char, cursor, y)
    cursor += widths[index] + spacing
  })
  ctx.restore()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    if (/^https?:/i.test(src)) image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('照片读取失败'))
    image.src = src
  })
}

function drawCover(ctx, image, x, y, width, height, radius) {
  const imageRatio = image.width / image.height
  const boxRatio = width / height
  let sourceWidth = image.width
  let sourceHeight = image.height
  let sourceX = 0
  let sourceY = 0

  if (imageRatio > boxRatio) {
    sourceWidth = image.height * boxRatio
    sourceX = (image.width - sourceWidth) / 2
  } else {
    sourceHeight = image.width / boxRatio
    sourceY = (image.height - sourceHeight) / 2
  }

  ctx.save()
  roundedRect(ctx, x, y, width, height, radius)
  ctx.clip()
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  )
  ctx.restore()
}

function drawPhoto(ctx, image, x, y, width, height, rotation = 0) {
  ctx.save()
  ctx.translate(x + width / 2, y + height / 2)
  ctx.rotate(rotation)
  const left = -width / 2
  const top = -height / 2

  ctx.shadowColor = 'rgba(123, 78, 89, 0.22)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 16
  ctx.fillStyle = '#fffaf3'
  roundedRect(ctx, left, top, width, height, 24)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  const border = 14
  drawCover(
    ctx,
    image,
    left + border,
    top + border,
    width - border * 2,
    height - border * 2,
    17,
  )

  ctx.strokeStyle = 'rgba(184, 135, 145, 0.2)'
  ctx.lineWidth = 1.5
  roundedRect(ctx, left + border / 2, top + border / 2, width - border, height - border, 19)
  ctx.stroke()
  ctx.restore()
}

function drawHeart(ctx, cx, cy, size) {
  ctx.save()
  ctx.translate(cx, cy)
  const gradient = ctx.createLinearGradient(-size, -size, size, size)
  gradient.addColorStop(0, '#efbdc7')
  gradient.addColorStop(0.58, '#de9eaf')
  gradient.addColorStop(1, '#d28a9f')
  ctx.shadowColor = 'rgba(188, 105, 125, 0.32)'
  ctx.shadowBlur = 32
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(0, size * 0.38)
  ctx.bezierCurveTo(-size * 1.32, -size * 0.32, -size * 0.5, -size * 1.18, 0, -size * 0.34)
  ctx.bezierCurveTo(size * 0.5, -size * 1.18, size * 1.32, -size * 0.32, 0, size * 0.38)
  ctx.closePath()
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  ctx.fillStyle = 'rgba(255, 251, 244, 0.9)'
  ctx.font = 'italic 22px "Georgia", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('1', 0, 4)
  ctx.restore()
}

function drawBackground(ctx) {
  const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  background.addColorStop(0, '#fff9f4')
  background.addColorStop(0.46, '#fdecee')
  background.addColorStop(1, '#f9f2ea')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const blobs = [
    { x: 120, y: 190, r: 300, color: '236, 202, 211' },
    { x: 1080, y: 260, r: 330, color: '219, 202, 228' },
    { x: 140, y: 1400, r: 330, color: '242, 216, 194' },
    { x: 1040, y: 1380, r: 320, color: '232, 201, 211' },
    { x: 600, y: 120, r: 260, color: '255, 247, 230' },
  ]
  for (const blob of blobs) {
    const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r)
    gradient.addColorStop(0, `rgba(${blob.color}, 0.48)`)
    gradient.addColorStop(0.55, `rgba(${blob.color}, 0.16)`)
    gradient.addColorStop(1, `rgba(${blob.color}, 0)`)
    ctx.fillStyle = gradient
    ctx.fillRect(blob.x - blob.r, blob.y - blob.r, blob.r * 2, blob.r * 2)
  }

  // Fine paper grain.
  for (let i = 0; i < 2600; i += 1) {
    const x = Math.random() * WIDTH
    const y = Math.random() * HEIGHT
    ctx.fillStyle = `rgba(130, 95, 88, ${Math.random() * 0.035})`
    ctx.fillRect(x, y, Math.random() * 1.6 + 0.4, Math.random() * 1.6 + 0.4)
  }

  ctx.strokeStyle = 'rgba(181, 138, 140, 0.18)'
  ctx.lineWidth = 2
  roundedRect(ctx, 34, 34, WIDTH - 68, HEIGHT - 68, 38)
  ctx.stroke()
}

function drawPassionHearts(ctx) {
  const colors = ['rgba(234, 182, 195, 0.68)', 'rgba(213, 197, 230, 0.58)', 'rgba(239, 205, 183, 0.6)']
  const points = [
    [92, 420],
    [1080, 410],
    [160, 1180],
    [1045, 1205],
    [280, 320],
    [900, 300],
    [590, 1310],
  ]
  points.forEach(([x, y], index) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((index % 2 ? 1 : -1) * 0.3)
    ctx.scale(0.38, 0.38)
    ctx.fillStyle = colors[index % colors.length]
    ctx.beginPath()
    ctx.moveTo(0, 38)
    ctx.bezierCurveTo(-132, -32, -50, -118, 0, -34)
    ctx.bezierCurveTo(50, -118, 132, -32, 0, 38)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  })
}

export async function downloadCelebrationCard({
  leftPhoto,
  rightPhoto,
  dateLabel,
  stamp,
}) {
  if (!leftPhoto || !rightPhoto) {
    throw new Error('需要两张照片')
  }

  await document.fonts?.ready

  const [leftImage, rightImage] = await Promise.all([
    loadImage(leftPhoto),
    loadImage(rightPhoto),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法生成图片')

  drawBackground(ctx)
  drawPassionHearts(ctx)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(167, 120, 134, 0.78)'
  ctx.font = '500 21px "Georgia", "Times New Roman", serif'
  spacedText(ctx, CELEBRATION.kicker, WIDTH / 2, 132, 8)

  ctx.fillStyle = '#664a54'
  ctx.font = '500 66px "YouYuan", "Microsoft YaHei", sans-serif'
  ctx.fillText(CELEBRATION.title, WIDTH / 2, 232)

  ctx.fillStyle = 'rgba(137, 105, 111, 0.62)'
  ctx.font = 'italic 26px "Georgia", "Times New Roman", serif'
  ctx.fillText(CELEBRATION.english, WIDTH / 2, 286)

  ctx.fillStyle = 'rgba(157, 121, 123, 0.34)'
  ctx.font = '15px "Georgia", serif'
  spacedText(ctx, CELEBRATION.foreverLine, WIDTH / 2, 324, 3)

  const photoWidth = 394
  const photoHeight = 700
  drawPhoto(ctx, leftImage, 130, 420, photoWidth, photoHeight, -0.026)
  drawPhoto(ctx, rightImage, WIDTH - 130 - photoWidth, 420, photoWidth, photoHeight, 0.026)

  drawHeart(ctx, WIDTH / 2, 770, 58)

  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(143, 107, 103, 0.46)'
  ctx.font = '16px "Georgia", serif'
  spacedText(ctx, CELEBRATION.kicker, 112, 1282, 4, 'left')

  ctx.font = 'italic 25px "Georgia", "Times New Roman", serif'
  ctx.fillStyle = 'rgba(111, 82, 84, 0.72)'
  ctx.fillText(CELEBRATION.english, 112, 1332)

  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(126, 91, 92, 0.62)'
  ctx.font = '18px "YouYuan", "Microsoft YaHei", sans-serif'
  ctx.fillText(`${UI.celebration.datePrefix} ${dateLabel}`, WIDTH - 106, 1504)

  ctx.fillStyle = 'rgba(164, 129, 122, 0.4)'
  ctx.font = '12px "Georgia", serif'
  spacedText(ctx, CELEBRATION.cardFooter, WIDTH / 2, 1546, 4, 'center')

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1))
  if (!blob) throw new Error('无法生成图片')

  const datePart = (stamp || '').replace(/[^\d]/g, '') || 'today'
  const fileName = `${CELEBRATION.downloadName}-${datePart}.png`
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 2000)
  return fileName
}
