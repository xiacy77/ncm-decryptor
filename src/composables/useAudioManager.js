import { onBeforeUnmount, ref } from 'vue'
import { AUDIO, BGM_SCENES, TIMING, assetUrl } from '@/config/story'

/**
 * 分场景 BGM 管理器。
 *
 * - AUDIO.sceneBgm 里的每个 key 都是一个可切换场景，App.vue 通过
 *   audio.startScene() / audio.setScene() 切换。
 * - 不同歌曲之间用两个 Audio 通道交叉淡化；同一首歌（例如 bloom → letter）
 *   只调整音量，不会从头重播。
 * - 浏览器不允许自动播放时，会保留“待播放”状态；第一次点击 / 触摸 / 键盘操作
 *   以及 SoundToggle 的重试都会重新尝试。
 * - 新增场景不需要改这个文件，只要在 story.js 里加 sceneBgm 条目，
 *   再把 BGM_SCENES 里对应区域指向它即可。
 */

const DEFAULT_SCENE = BGM_SCENES?.stars || 'stars'
const FALLBACK_SCENE = BGM_SCENES?.bloom || 'bloom'
const MAX_VOLUME = 1

const clampVolume = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(MAX_VOLUME, Math.max(0, number))
}

export function useAudioManager() {
  const enabled = ref(true)
  const started = ref(false)
  const blocked = ref(false)
  const playing = ref(false)
  const scene = ref(DEFAULT_SCENE)

  // 两个通道交替使用，才能做真正的交叉淡化；切换回同一首歌时也能从暂停处继续。
  const channels = []
  const trackMeta = []
  if (typeof Audio !== 'undefined') {
    for (let index = 0; index < 2; index += 1) {
      const channel = new Audio()
      channel.loop = true
      channel.preload = 'none'
      channel.volume = 0
      channels.push(channel)
      trackMeta.push({ src: null })
    }
  }

  let activeIndex = -1
  let fadeTimer = null
  let fadeToken = 0
  let switchToken = 0

  const sceneMap = AUDIO.sceneBgm || {}
  const legacyTrack = AUDIO.bgm
    ? {
        key: 'legacy',
        src: AUDIO.bgm,
        volume: clampVolume(TIMING.audio.bgmVolume),
      }
    : null

  const defaultVolume = () => clampVolume(TIMING.audio.bgmVolume)

  function readTrack(entry, key) {
    if (!entry) return null
    if (typeof entry === 'string') {
      return {
        key,
        src: entry,
        volume: defaultVolume(),
      }
    }
    if (!entry.src) return null
    return {
      key,
      src: entry.src,
      volume: clampVolume(entry.volume ?? defaultVolume()),
      fade: Number(entry.fade) || null,
    }
  }

  function resolveTrack(key) {
    const direct = readTrack(sceneMap[key], key)
    if (direct) return direct

    const fallback = readTrack(sceneMap[FALLBACK_SCENE], FALLBACK_SCENE)
    if (fallback) return fallback

    return legacyTrack
  }

  function clearFade() {
    fadeToken += 1
    if (fadeTimer) {
      clearInterval(fadeTimer)
      fadeTimer = null
    }
  }

  function runFade(entries, duration, onDone) {
    const list = entries.filter((entry) => entry?.channel)
    if (!list.length) {
      onDone?.()
      return
    }

    clearFade()
    const token = fadeToken
    const from = list.map((entry) => ({
      channel: entry.channel,
      from: entry.channel.volume,
      to: clampVolume(entry.to),
    }))

    if (!Number.isFinite(duration) || duration <= 0) {
      for (const item of from) item.channel.volume = item.to
      onDone?.()
      return
    }

    const startedAt = performance.now()
    fadeTimer = setInterval(() => {
      if (token !== fadeToken) return
      const progress = Math.min(1, (performance.now() - startedAt) / duration)
      for (const item of from) {
        item.channel.volume = item.from + (item.to - item.from) * progress
      }
      if (progress >= 1) {
        clearInterval(fadeTimer)
        fadeTimer = null
        onDone?.()
      }
    }, 32)
  }

  function stopChannel(index) {
    const channel = channels[index]
    if (!channel) return
    channel.pause()
    channel.volume = 0
  }

  function stopInactive(keepIndex) {
    for (let index = 0; index < channels.length; index += 1) {
      if (index !== keepIndex) stopChannel(index)
    }
  }

  function setChannelTrack(index, track) {
    const channel = channels[index]
    if (!channel) return
    channel.pause()
    channel.preload = 'auto'
    if (trackMeta[index].src !== track.src) {
      channel.src = assetUrl(track.src)
      channel.load()
      trackMeta[index].src = track.src
    }
    channel.loop = true
    channel.volume = 0
  }

  function fadeOutAll() {
    playing.value = false
    const audible = channels
      .filter((channel) => !channel.paused)
      .map((channel) => ({ channel, to: 0 }))
    if (!audible.length) {
      for (let index = 0; index < channels.length; index += 1) stopChannel(index)
      return
    }
    runFade(audible, TIMING.audio.fadeOut ?? 900, () => {
      for (let index = 0; index < channels.length; index += 1) stopChannel(index)
    })
  }

  async function switchTo(key, { duration } = {}) {
    const track = resolveTrack(key)
    if (!track) return false

    scene.value = key
    if (!started.value || !enabled.value) return false

    const token = ++switchToken
    const fadeDuration =
      Number(duration) ||
      track.fade ||
      Number(TIMING.audio.sceneFade) ||
      1800
    const current = activeIndex

    // 先停掉上一次还没结束的淡化，避免旧通道在切换时继续响。
    clearFade()

    // 同一首歌只调音量：bloom ↔ letter 不会把同一首《特别的人》从头播放。
    if (current >= 0 && trackMeta[current].src === track.src) {
      stopInactive(current)
      const channel = channels[current]
      if (channel.paused) {
        channel.volume = 0
        try {
          await channel.play()
        } catch {
          blocked.value = true
          playing.value = false
          return false
        }
      }
      if (token !== switchToken) return false
      blocked.value = false
      playing.value = true
      runFade([{ channel, to: track.volume }], fadeDuration)
      return true
    }

    // 切换前先停掉不在用的通道；新通道加载期间旧歌继续播放。
    stopInactive(current)

    const next = current === 0 ? 1 : 0
    const nextChannel = channels[next]
    if (!nextChannel) return false

    if (trackMeta[next].src !== track.src) {
      setChannelTrack(next, track)
    } else {
      // 暂停在同一条轨道时从原位置继续。
      nextChannel.pause()
      nextChannel.volume = 0
    }

    try {
      nextChannel.preload = 'auto'
      await nextChannel.play()
    } catch {
      // 新歌加载失败时，旧歌继续；只有完全没有声音时才标记为 blocked。
      if (activeIndex >= 0 && !channels[activeIndex].paused) {
        blocked.value = false
        playing.value = true
      } else {
        blocked.value = true
        playing.value = false
      }
      return false
    }

    // 如果加载期间又切了场景，让新一轮切换接管通道。
    if (token !== switchToken) return false

    blocked.value = false
    playing.value = true
    const previous = activeIndex
    activeIndex = next

    if (previous >= 0 && previous !== next) {
      runFade(
        [
          { channel: channels[previous], to: 0 },
          { channel: nextChannel, to: track.volume },
        ],
        fadeDuration,
        () => {
          if (activeIndex !== previous) stopChannel(previous)
        },
      )
    } else {
      runFade([{ channel: nextChannel, to: track.volume }], fadeDuration)
    }
    return true
  }

  async function startBgm() {
    if (started.value) return
    started.value = true
    if (!enabled.value) return
    await switchTo(scene.value, {
      duration: TIMING.audio.fadeIn ?? 3000,
    })
  }

  async function retryBgm() {
    if (!enabled.value) return false
    if (!started.value) {
      await startBgm()
      return !blocked.value
    }
    return switchTo(scene.value, {
      duration: TIMING.audio.sceneFade ?? 1800,
    })
  }

  async function toggleSound() {
    enabled.value = !enabled.value

    if (!enabled.value) {
      fadeOutAll()
      return
    }

    if (!started.value) {
      await startBgm()
      return
    }

    await retryBgm()
  }

  /** 只切场景，不主动开始播放；适合在 close / 回退时调用。 */
  function setScene(key, options = {}) {
    scene.value = key
    if (!started.value || !enabled.value) return
    void switchTo(key, options)
  }

  /** 切场景并确保已经开始播放；适合点击进入某个区域时调用。 */
  function startScene(key, options = {}) {
    scene.value = key
    if (!started.value) return startBgm()
    if (!enabled.value) return
    return switchTo(key, options)
  }

  const playSfx = async (path, volume = 0.36) => {
    if (!enabled.value || typeof Audio === 'undefined') return
    try {
      const sound = new Audio(assetUrl(path))
      sound.volume = clampVolume(volume)
      await sound.play()
    } catch {
      // 音效被拦截或文件缺失时保持安静，不影响剧情推进。
    }
  }

  const playChime = () => playSfx(AUDIO.chime, 0.34)

  onBeforeUnmount(() => {
    clearFade()
    for (const channel of channels) {
      channel.pause()
      channel.src = ''
    }
  })

  return {
    enabled,
    started,
    blocked,
    playing,
    scene,
    startBgm,
    retryBgm,
    toggleSound,
    setScene,
    startScene,
    playChime,
  }
}
