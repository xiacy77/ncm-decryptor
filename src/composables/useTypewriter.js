import { onBeforeUnmount, ref } from 'vue'

/**
 * 逐字打印。标点处稍作停顿，读起来更像有人在小声说话。
 */
export function useTypewriter({ speed = 80, startDelay = 0, linePause = 480 } = {}) {
  const output = ref('')
  const isTyping = ref(false)
  const isDone = ref(false)
  let timer = null
  let fullText = ''
  let cursor = 0
  let activeSpeed = speed

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const reset = () => {
    clearTimer()
    output.value = ''
    isTyping.value = false
    isDone.value = false
    fullText = ''
    cursor = 0
  }

  const typeNext = () => {
    if (cursor >= fullText.length) {
      isTyping.value = false
      isDone.value = true
      return
    }

    const char = fullText[cursor]
    output.value += char
    cursor += 1

    let delay = activeSpeed
    if (char === '\n') delay = linePause
    else if (/[，。！？、~～]/.test(char)) delay = activeSpeed + 180

    timer = setTimeout(typeNext, delay)
  }

  const play = (text, options = {}) => {
    clearTimer()
    fullText = String(text ?? '')
    activeSpeed = options.speed ?? speed
    cursor = 0
    output.value = ''
    isDone.value = false
    isTyping.value = true
    timer = setTimeout(typeNext, options.startDelay ?? startDelay)
  }

  const finish = () => {
    clearTimer()
    output.value = fullText
    cursor = fullText.length
    isTyping.value = false
    isDone.value = true
  }

  onBeforeUnmount(clearTimer)

  return { output, isTyping, isDone, play, reset, finish }
}
