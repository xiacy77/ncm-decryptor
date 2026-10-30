import { GESTURE_THRESHOLDS } from '@/config/gesture'
import { clamp, distance } from '@/utils/math'

/**
 * MediaPipe 的 21 个手部关键点：
 * 0 腕部；1-4 拇指；5-8 食指；9-12 中指；13-16 无名指；17-20 小指。
 *
 * 这里只做几何判定：不依赖任何服务端，不保存、不上传摄像头画面。
 */

export const GESTURE_LABELS = {
  none: '等待手势',
  openPalm: '张开手掌',
  fist: '握拳',
  thumbsUp: '点赞',
  ok: 'OK',
  loveYou: '爱你',
  scissors: '剪刀手',
  crossed: '静谧模式',
}

export const GESTURE_SYMBOLS = {
  none: '·',
  openPalm: '🖐',
  fist: '✊',
  thumbsUp: '👍',
  ok: '👌',
  loveYou: '🤟',
  scissors: '✌️',
  crossed: '🫶',
}

const FINGER_JOINTS = {
  index: { mcp: 5, pip: 6, tip: 8 },
  middle: { mcp: 9, pip: 10, tip: 12 },
  ring: { mcp: 13, pip: 14, tip: 16 },
  pinky: { mcp: 17, pip: 18, tip: 20 },
}

function angleAt(a, b, c) {
  const v1 = { x: a.x - b.x, y: a.y - b.y, z: (a.z ?? 0) - (b.z ?? 0) }
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: (c.z ?? 0) - (b.z ?? 0) }
  const length1 = Math.hypot(v1.x, v1.y, v1.z) || 1e-6
  const length2 = Math.hypot(v2.x, v2.y, v2.z) || 1e-6
  const cosine = clamp(
    (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z) / (length1 * length2),
    -1,
    1,
  )
  return (Math.acos(cosine) * 180) / Math.PI
}

function meanPoint(points) {
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 },
  )
  return { x: total.x / points.length, y: total.y / points.length }
}

function fingerIsStraight(landmarks, joint, wrist) {
  const mcp = landmarks[joint.mcp]
  const pip = landmarks[joint.pip]
  const tip = landmarks[joint.tip]
  const angle = angleAt(mcp, pip, tip)
  const tipReach = distance(tip, wrist)
  const pipReach = distance(pip, wrist)
  return angle > GESTURE_THRESHOLDS.fingerStraightAngle && tipReach > pipReach * 1.08
}

/**
 * 分析一只手的姿态。返回姿态名、伸展情况、掌心与掌宽，供上层做连续动画。
 */
export function analyzeHand(landmarks) {
  const wrist = landmarks[0]
  const palmPoints = [landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]]
  const palm = meanPoint(palmPoints)
  const palmWidth = Math.max(
    distance(landmarks[5], landmarks[17]),
    distance(landmarks[0], landmarks[9]) * 0.72,
    0.035,
  )

  const straight = {
    index: fingerIsStraight(landmarks, FINGER_JOINTS.index, wrist),
    middle: fingerIsStraight(landmarks, FINGER_JOINTS.middle, wrist),
    ring: fingerIsStraight(landmarks, FINGER_JOINTS.ring, wrist),
    pinky: fingerIsStraight(landmarks, FINGER_JOINTS.pinky, wrist),
  }

  const thumbTip = landmarks[4]
  const thumbIp = landmarks[3]
  const thumbMcp = landmarks[2]
  const thumbAngle = angleAt(thumbMcp, thumbIp, thumbTip)
  const thumbExtended =
    thumbAngle > GESTURE_THRESHOLDS.thumbStraightAngle &&
    distance(thumbTip, palm) > palmWidth * 0.85

  const folded = {
    index: distance(landmarks[8], palm) < palmWidth * GESTURE_THRESHOLDS.foldedTipRatio,
    middle: distance(landmarks[12], palm) < palmWidth * GESTURE_THRESHOLDS.foldedTipRatio,
    ring: distance(landmarks[16], palm) < palmWidth * GESTURE_THRESHOLDS.foldedTipRatio,
    pinky: distance(landmarks[20], palm) < palmWidth * GESTURE_THRESHOLDS.foldedTipRatio,
  }

  const extendedCount = Object.values(straight).filter(Boolean).length
  const foldedCount = Object.values(folded).filter(Boolean).length
  const scissorsSpread =
    distance(landmarks[8], landmarks[12]) > palmWidth * GESTURE_THRESHOLDS.scissorsSpreadRatio
  const okPinch =
    distance(thumbTip, landmarks[8]) < palmWidth * GESTURE_THRESHOLDS.okPinchRatio

  let gesture = 'none'

  if (
    straight.middle &&
    straight.ring &&
    straight.pinky &&
    thumbExtended &&
    okPinch
  ) {
    // OK 手势：拇指与食指围成一个环，其余三根手指自然伸展。
    gesture = 'ok'
  } else if (
    !straight.index &&
    !straight.middle &&
    !straight.ring &&
    !straight.pinky &&
    thumbExtended &&
    thumbTip.y < palm.y - palmWidth * GESTURE_THRESHOLDS.thumbUpLiftRatio
  ) {
    gesture = 'thumbsUp'
  } else if (
    straight.index &&
    straight.pinky &&
    !straight.middle &&
    !straight.ring &&
    thumbExtended
  ) {
    // 爱你手势：拇指、食指、小指伸出。
    gesture = 'loveYou'
  } else if (
    straight.index &&
    straight.middle &&
    !straight.ring &&
    !straight.pinky &&
    scissorsSpread
  ) {
    gesture = 'scissors'
  } else if (extendedCount >= 3) {
    gesture = 'openPalm'
  } else if (foldedCount >= 3 && thumbTip.y > palm.y - palmWidth * 0.35) {
    gesture = 'fist'
  }

  return {
    gesture,
    extendedCount,
    foldedCount,
    thumbExtended,
    okPinch,
    palm,
    palmWidth,
    straight,
    folded,
    landmarks,
  }
}

function closestHandDistance(handA, handB) {
  // 摄像头画面是 4:3，横向归一化距离需要按比例校正后再比较。
  const dx = (handA.palm.x - handB.palm.x) * 1.333
  const dy = handA.palm.y - handB.palm.y
  return Math.hypot(dx, dy)
}

/** 两只手靠得很近时，视作「十指相扣」的静谧手势。 */
export function classifyHands(hands = []) {
  const analyses = hands.map(analyzeHand)
  if (!analyses.length) {
    return { gesture: 'none', analyses, primary: null, crossed: false }
  }

  let crossed = false
  if (analyses.length >= 2) {
    let closest = Infinity
    for (let i = 0; i < analyses.length; i += 1) {
      for (let j = i + 1; j < analyses.length; j += 1) {
        closest = Math.min(closest, closestHandDistance(analyses[i], analyses[j]))
      }
    }
    crossed = closest < GESTURE_THRESHOLDS.crossHandDistance
  }

  const primary = [...analyses].sort((a, b) => b.palmWidth - a.palmWidth)[0]

  return {
    gesture: crossed ? 'crossed' : primary.gesture,
    analyses,
    primary,
    crossed,
  }
}

/** 摄像头画面镜像后，手掌在屏幕上的坐标。 */
export function toDisplayPalm(palm, mirrorX = true) {
  return {
    x: mirrorX ? 1 - palm.x : palm.x,
    y: palm.y,
  }
}
