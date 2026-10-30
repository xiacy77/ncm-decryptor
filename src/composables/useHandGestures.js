import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { CAMERA_CONSTRAINTS, HAND_TRACKING } from '@/config/gesture'
import { GESTURE_LABELS, classifyHands, toDisplayPalm } from '@/utils/gestures'
import { clamp, lerp } from '@/utils/math'

/**
 * 浏览器端 MediaPipe Hands。
 *
 * - hands.js / wasm / tflite 全部来自 public/mediapipe（构建前自动拷贝），
 *   不依赖 CDN，也不需要 Python 或任何后端；
 * - 摄像头画面只用于本地推理；
 * - 摄像头拒绝、浏览器不支持或模型加载失败，都会落到鼠标模式，剧情不会中断。
 */

let sharedScriptPromise = null

const getRuntimeBase = () => new URL(import.meta.env.BASE_URL, window.location.href)

const getMediapipeBase = () => new URL('mediapipe/', getRuntimeBase())

function loadHandsScript() {
  if (window.Hands) return Promise.resolve(window.Hands)
  if (sharedScriptPromise) return sharedScriptPromise

  sharedScriptPromise = new Promise((resolve, reject) => {
    const src = new URL('mediapipe/hands.js', getRuntimeBase()).href
    const existing = document.querySelector('script[data-star-hands]')
    // A previously failed tag must not poison every retry.
    if (existing) existing.remove()

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.starHands = 'true'
    script.onload = () => {
      if (window.Hands) resolve(window.Hands)
      else reject(new Error('手势运行时没有正确初始化'))
    }
    script.onerror = () => {
      script.remove()
      reject(new Error('手势脚本加载失败，请检查 public/mediapipe'))
    }
    document.head.appendChild(script)
  }).catch((error) => {
    sharedScriptPromise = null
    throw error
  })

  return sharedScriptPromise
}

function normaliseCameraError(error) {
  const name = error?.name || ''
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return { status: 'denied', message: '摄像头权限未开启' }
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
    return { status: 'no-camera', message: '没有找到可用的摄像头' }
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return { status: 'busy', message: '摄像头正被其他程序占用' }
  }
  if (name === 'SecurityError') {
    return { status: 'unsupported', message: '当前页面不是安全环境，摄像头需要 HTTPS 或 localhost' }
  }
  return { status: 'error', message: error?.message || '手势识别没有成功启动' }
}

export function useHandGestures() {
  const status = ref('idle')
  const errorMessage = ref('')
  const gesture = ref('none')
  const handsCount = ref(0)
  const stream = shallowRef(null)
  const lastGesture = ref({ id: 0, name: 'none', point: null, at: 0 })

  /**
   * 供 canvas / requestAnimationFrame 读取的高频位置，保持非响应式，
   * 避免 20fps 的手部坐标触发整棵 Vue 组件树更新。
   */
  const live = {
    palm: { x: 0.5, y: 0.5, present: false },
    rawGesture: 'none',
    analyses: [],
  }

  let sessionId = 0
  let running = false
  let handsInstance = null
  let videoElement = null
  let frameHandle = 0
  let lastSentAt = 0
  let processing = false
  let sendErrors = 0
  let missingFrames = 0
  let pendingName = 'none'
  let pendingCount = 0
  let firstResultTimer = null
  let gestureEventId = 0

  const isReady = computed(() => status.value === 'ready')
  const isActive = computed(() =>
    ['requesting', 'loading', 'ready'].includes(status.value),
  )
  const gestureLabel = computed(() => GESTURE_LABELS[gesture.value] ?? '等待手势')

  const clearFirstResultTimer = () => {
    if (firstResultTimer) {
      clearTimeout(firstResultTimer)
      firstResultTimer = null
    }
  }

  const emitGesture = (name) => {
    if (name === 'none') return
    gestureEventId += 1
    lastGesture.value = {
      id: gestureEventId,
      name,
      point: { ...live.palm },
      at: performance.now(),
    }
  }

  const updateStableGesture = (name) => {
    live.rawGesture = name

    if (gesture.value === name) {
      pendingName = 'none'
      pendingCount = 0
      return
    }

    if (pendingName === name) {
      pendingCount += 1
    } else {
      pendingName = name
      pendingCount = 1
    }

    if (pendingCount >= HAND_TRACKING.stableFrames) {
      const previous = gesture.value
      gesture.value = name
      pendingName = 'none'
      pendingCount = 0
      if (name !== 'none' && previous !== name) emitGesture(name)
    }
  }

  const handleResults = (results) => {
    // 模型只要返回首帧就视为就绪，即使画面里暂时还没有手。
    if (status.value !== 'ready') {
      clearFirstResultTimer()
      status.value = 'ready'
      errorMessage.value = ''
    }

    const handLandmarks = results?.multiHandLandmarks ?? []
    handsCount.value = handLandmarks.length

    if (!handLandmarks.length) {
      missingFrames += 1
      live.analyses = []
      if (missingFrames >= 3) {
        live.palm.present = false
        updateStableGesture('none')
      }
      return
    }

    missingFrames = 0
    const classification = classifyHands(handLandmarks)
    live.analyses = classification.analyses

    if (classification.primary) {
      const displayPalm = toDisplayPalm(
        classification.primary.palm,
        HAND_TRACKING.mirrorX,
      )
      const smoothing = live.palm.present ? HAND_TRACKING.palmSmoothing : 1
      live.palm.x = clamp(lerp(live.palm.x, displayPalm.x, smoothing), 0.01, 0.99)
      live.palm.y = clamp(lerp(live.palm.y, displayPalm.y, smoothing), 0.01, 0.99)
      live.palm.present = true
    }

    updateStableGesture(classification.gesture)
  }

  const stopTracks = () => {
    stream.value?.getTracks?.().forEach((track) => track.stop())
    stream.value = null
  }

  const cleanup = ({ nextStatus = 'idle' } = {}) => {
    running = false
    processing = false
    cancelAnimationFrame(frameHandle)
    clearFirstResultTimer()
    stopTracks()

    if (handsInstance) {
      try {
        handsInstance.close()
      } catch {
        // MediaPipe close can race with a pending frame; nothing else to do.
      }
      handsInstance = null
    }

    if (videoElement) {
      try {
        videoElement.pause()
        videoElement.srcObject = null
      } catch {
        // noop
      }
      videoElement.remove()
      videoElement = null
    }

    live.palm.present = false
    live.analyses = []
    gesture.value = 'none'
    pendingName = 'none'
    pendingCount = 0
    handsCount.value = 0
    status.value = nextStatus
  }

  const stop = () => {
    sessionId += 1
    cleanup({ nextStatus: 'idle' })
  }

  const start = async (options = {}) => {
    if (['requesting', 'loading', 'ready'].includes(status.value)) return
    if (!window.isSecureContext) {
      status.value = 'unsupported'
      errorMessage.value = '摄像头需要 HTTPS 或 localhost 环境'
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      status.value = 'unsupported'
      errorMessage.value = '当前浏览器不支持 getUserMedia'
      return
    }

    const currentSession = ++sessionId
    running = true
    status.value = 'requesting'
    errorMessage.value = ''
    sendErrors = 0
    clearFirstResultTimer()

    let mediaStream
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS)
    } catch (error) {
      if (currentSession !== sessionId) return
      running = false
      const info = normaliseCameraError(error)
      status.value = info.status
      errorMessage.value = info.message
      return
    }

    if (currentSession !== sessionId || !running) {
      mediaStream.getTracks().forEach((track) => track.stop())
      return
    }

    stream.value = mediaStream
    status.value = 'loading'

    try {
      const video = document.createElement('video')
      video.muted = true
      video.autoplay = true
      video.playsInline = true
      video.setAttribute('playsinline', '')
      video.setAttribute('webkit-playsinline', '')
      video.setAttribute('aria-hidden', 'true')
      video.srcObject = mediaStream
      video.style.cssText =
        'position:fixed;left:-4px;bottom:-4px;width:2px;height:2px;opacity:0;pointer-events:none;'
      document.body.appendChild(video)
      videoElement = video
      await video.play()

      const HandsCtor = await loadHandsScript()
      if (currentSession !== sessionId || !running) return

      const mediapipeBase = getMediapipeBase()
      const instance = new HandsCtor({
        locateFile: (file) => new URL(file, mediapipeBase).href,
      })

      const isCompactDevice = window.matchMedia(
        '(max-width: 760px), (pointer: coarse)',
      ).matches
      const modelComplexity =
        HAND_TRACKING.adaptiveModel && isCompactDevice
          ? 0
          : HAND_TRACKING.modelComplexity

      instance.setOptions({
        maxNumHands: HAND_TRACKING.maxNumHands,
        modelComplexity,
        minDetectionConfidence: HAND_TRACKING.minDetectionConfidence,
        minTrackingConfidence: HAND_TRACKING.minTrackingConfidence,
        selfieMode: false,
      })
      instance.onResults(handleResults)
      handsInstance = instance

      // 官方 Camera 示例是直接用 send() 驱动图执行的；这里同样不在首帧前
      // await initialize()，避免个别浏览器在初始化 Promise 上卡住。
      const frameInterval = 1000 / HAND_TRACKING.targetFps
      const frameLoop = (now) => {
        if (!running || currentSession !== sessionId) return
        if (
          video.readyState >= 2 &&
          !processing &&
          now - lastSentAt >= frameInterval
        ) {
          processing = true
          lastSentAt = now
          instance
            .send({ image: video })
            .catch(() => {
              if (currentSession !== sessionId) return
              sendErrors += 1
              if (sendErrors > 4) {
                errorMessage.value = '手势模型运行中断，已切换为鼠标模式'
                cleanup({ nextStatus: 'error' })
              }
            })
            .finally(() => {
              processing = false
            })
        }
        frameHandle = requestAnimationFrame(frameLoop)
      }

      frameHandle = requestAnimationFrame(frameLoop)

      firstResultTimer = setTimeout(() => {
        if (currentSession === sessionId && status.value !== 'ready') {
          errorMessage.value = '手势模型加载超时，请检查网络后重试'
          status.value = 'error'
        }
      }, options.timeout ?? 22000)
    } catch (error) {
      if (currentSession !== sessionId) return
      errorMessage.value = error?.message || '手势模型加载失败'
      cleanup({ nextStatus: 'error' })
    }
  }

  onBeforeUnmount(() => {
    sessionId += 1
    cleanup()
  })

  return {
    status,
    errorMessage,
    gesture,
    gestureLabel,
    handsCount,
    isReady,
    isActive,
    lastGesture,
    stream,
    live,
    start,
    stop,
  }
}
