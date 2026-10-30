/**
 * MediaPipe Hands 的参数与手势判定阈值。
 * 手势识别只发生在浏览器本地；画面不会离开设备。
 *
 * 这一版把稳定帧数降到了 2 帧、检测置信度调低，并放宽了指尖折叠 / 剪刀手
 * 的张角阈值，让日常自然手势更容易被识别；同时桌面端默认使用更准的 full 模型。
 */
export const HAND_TRACKING = {
  maxNumHands: 2,
  // 桌面端使用更准的 full 模型，小屏设备自动回落到 lite 模型。
  modelComplexity: 1,
  adaptiveModel: true,
  minDetectionConfidence: 0.48,
  minTrackingConfidence: 0.46,
  targetFps: 24,
  stableFrames: 2,
  mirrorX: true,
  palmSmoothing: 0.45,
  crossHandDistance: 0.45,
}

export const GESTURE_THRESHOLDS = {
  // 关节点角度大于此值视为伸直（单位：度）
  fingerStraightAngle: 140,
  thumbStraightAngle: 130,
  // 指尖到掌心的距离小于 palmWidth * 此值，视为收回
  foldedTipRatio: 1.03,
  // 剪刀手两根手指的指尖间距 / 掌宽
  scissorsSpreadRatio: 0.2,
  // 大拇指朝上：拇指尖要比掌心高出 palmWidth * 此值
  thumbUpLiftRatio: 0.42,
  // 双手十指相扣：两只手主要掌心的平均距离（按 4:3 画面校正）
  crossHandDistance: 0.45,
  // OK 手势：拇指尖与食指尖的距离 / 掌宽
  okPinchRatio: 0.43,
}

export const CAMERA_CONSTRAINTS = {
  audio: false,
  video: {
    facingMode: 'user',
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 24, max: 30 },
  },
}
