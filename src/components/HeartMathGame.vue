<script setup>
import { computed, inject, nextTick, ref } from 'vue'
import { LOVE_NOTES, MINI_GAMES, UI } from '@/config/story'
import { AUDIO_KEY } from '@/keys'

const emit = defineEmits(['complete'])

const audio = inject(AUDIO_KEY, null)
const game = MINI_GAMES.math
const questions = ref([])
const current = ref(0)
const answer = ref('')
const solved = ref([])
const wrong = ref(false)
const hintVisible = ref(false)
const finished = ref(false)
const inputEl = ref(null)
const notice = ref(UI.play.mathInput)
const successNote = ref('')

const question = computed(() => questions.value[current.value] ?? null)
const code = computed(() =>
  solved.value.length ? solved.value.join('') : '???',
)

function pickSet() {
  const sets = game.sets
  const chosen = sets[Math.floor(Math.random() * sets.length)]
  questions.value = chosen.map((item) => ({ ...item }))
}

function pickLoveNote() {
  successNote.value = LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)]
}

pickSet()

function focusInput() {
  nextTick(() => inputEl.value?.focus())
}

function checkAnswer() {
  if (!question.value || finished.value) return
  const raw = String(answer.value ?? '').trim()
  if (!raw) {
    wrong.value = true
    notice.value = UI.play.mathWrong
    return
  }

  const value = Number(raw)
  if (Number.isFinite(value) && value === question.value.answer) {
    solved.value = [...solved.value, question.value.answer]
    wrong.value = false
    hintVisible.value = false
    answer.value = ''
    if (current.value >= questions.value.length - 1) {
      finished.value = true
      notice.value = UI.play.mathSuccess
      pickLoveNote()
      audio?.playChime()
      emit('complete')
    } else {
      current.value += 1
      notice.value = UI.play.mathInput
      focusInput()
    }
  } else {
    wrong.value = true
    hintVisible.value = true
    notice.value = UI.play.mathWrong
  }
}

function showHint() {
  hintVisible.value = true
  notice.value = question.value?.hint || UI.play.mathHint
}

function reset() {
  pickSet()
  current.value = 0
  answer.value = ''
  solved.value = []
  wrong.value = false
  hintVisible.value = false
  finished.value = false
  successNote.value = ''
  notice.value = UI.play.mathInput
  focusInput()
}

focusInput()
</script>

<template>
  <div class="math-game" :class="{ 'is-finished': finished }">
    <div class="math-top">
      <div>
        <p class="math-kicker">{{ game.en }}</p>
        <h3>{{ game.title }}</h3>
      </div>
      <div class="math-code" :aria-label="UI.play.mathCodeAria(code)">
        <span
          v-for="(part, index) in game.codeParts"
          :key="`code-${index}`"
          class="code-digit"
          :class="{ 'is-filled': solved[index] !== undefined }"
        >{{ solved[index] ?? '?' }}</span>
      </div>
    </div>

    <template v-if="!finished">
      <div class="math-progress" aria-hidden="true">
        <span
          v-for="(item, index) in questions"
          :key="`progress-${index}`"
          :class="{ 'is-done': index < current, 'is-active': index === current }"
        ></span>
      </div>

      <div class="math-question" :class="{ 'is-wrong': wrong }">
        <span class="question-index">{{ UI.play.questionNumber(current + 1) }}</span>
        <p class="question-expression">{{ question?.expression }}</p>
        <p class="question-prompt">{{ UI.play.mathInput }}</p>

        <form class="math-input-row" @submit.prevent="checkAnswer">
          <input
            ref="inputEl"
            v-model="answer"
            type="number"
            inputmode="numeric"
            step="1"
            autocomplete="off"
            :aria-label="UI.play.answerAria"
            @input="wrong = false"
          />
          <button type="submit" class="math-check">{{ UI.play.mathCheck }}</button>
        </form>

        <button type="button" class="math-hint-toggle" @click="showHint">
          {{ UI.play.mathHint }}
        </button>

        <Transition name="hint">
          <p v-if="hintVisible" class="math-hint">{{ question?.hint }}</p>
        </Transition>
      </div>

      <p class="math-notice" role="status">{{ notice }}</p>
    </template>

    <Transition name="math-success">
      <div v-if="finished" class="math-success">
        <div class="success-hearts" aria-hidden="true">
          <span v-for="heart in 9" :key="heart" :style="{ '--heart': heart }">♥</span>
        </div>
        <p class="success-eyebrow">{{ UI.play.mathSuccess }}</p>
        <span class="success-heart" aria-hidden="true">♥</span>
        <h4>{{ game.successTitle }}</h4>
        <p class="success-code">{{ game.successCode }}</p>
        <p class="success-text">{{ game.successText }}</p>
        <p class="math-love-note">“{{ successNote }}”</p>
        <button type="button" class="math-again" @click="reset">
          {{ UI.play.again }}
        </button>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.math-game {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 10px 12px 18px;
  color: #513f46;
}

.math-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
}

.math-kicker {
  margin: 0 0 7px;
  color: rgba(159, 112, 119, 0.52);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.19em;
}

.math-top h3 {
  margin: 0;
  color: #665157;
  font-family: var(--font-display);
  font-size: clamp(23px, 3vw, 33px);
  font-weight: 400;
  letter-spacing: 0.11em;
}

.math-code {
  display: flex;
  gap: 6px;
  padding-top: 4px;
}

.code-digit {
  display: grid;
  place-items: center;
  min-width: 42px;
  height: 42px;
  padding: 0 8px;
  border: 1px solid rgba(191, 148, 150, 0.32);
  border-radius: 9px;
  color: rgba(128, 87, 94, 0.55);
  background: rgba(255, 250, 242, 0.62);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 21px;
  transition:
    color 0.45s ease,
    background 0.45s ease,
    transform 0.45s ease,
    box-shadow 0.45s ease;
}

.code-digit.is-filled {
  color: rgba(156, 88, 100, 0.88);
  background: rgba(249, 220, 219, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 7px 15px rgba(178, 120, 124, 0.14);
}

.math-question {
  position: relative;
  width: 100%;
  padding: 24px 24px 20px;
  border: 1px solid rgba(190, 150, 148, 0.29);
  border-radius: 19px;
  background:
    linear-gradient(90deg, rgba(193, 156, 143, 0.06) 1px, transparent 1px) 0 0 / 26px 26px,
    linear-gradient(rgba(193, 156, 143, 0.06) 1px, transparent 1px) 0 0 / 26px 26px,
    rgba(255, 250, 241, 0.6);
  box-shadow: inset 0 0 28px rgba(255, 255, 255, 0.28);
  transition: border-color 0.3s ease;
}

.math-question.is-wrong {
  border-color: rgba(194, 113, 124, 0.58);
  animation: wrong-shake 0.36s ease;
}

.question-index {
  color: rgba(127, 91, 93, 0.6);
  font-size: 9px;
  letter-spacing: 0.15em;
}

.question-expression {
  margin: 12px 0 4px;
  color: #654f56;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(34px, 5vw, 54px);
  letter-spacing: 0.07em;
  line-height: 1.3;
}

.question-prompt {
  margin: 0 0 15px;
  color: rgba(97, 72, 76, 0.64);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.math-input-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.math-input-row input {
  width: 120px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid rgba(190, 148, 147, 0.35);
  border-radius: 10px;
  outline: none;
  color: #5c4a50;
  background: rgba(255, 252, 246, 0.76);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 20px;
  text-align: center;
}

.math-input-row input:focus {
  border-color: rgba(180, 111, 123, 0.6);
  box-shadow: 0 0 0 3px rgba(215, 168, 169, 0.13);
}

.math-check,
.math-again {
  border: 1px solid rgba(193, 139, 147, 0.32);
  border-radius: 10px;
  color: rgba(130, 78, 89, 0.84);
  background: rgba(246, 215, 215, 0.65);
  font-size: 10px;
  letter-spacing: 0.05em;
  transition:
    background 0.3s ease,
    transform 0.3s ease;
}

.math-check {
  flex: 1;
  min-width: 110px;
}

.math-check:hover,
.math-again:hover {
  background: rgba(244, 202, 205, 0.84);
  transform: translateY(-1px);
}

.math-hint-toggle {
  margin-top: 11px;
  padding: 0;
  border: 0;
  color: rgba(126, 82, 89, 0.62);
  background: transparent;
  font-size: 9px;
  letter-spacing: 0.08em;
}

.math-hint {
  margin: 7px 0 0;
  color: rgba(111, 75, 80, 0.72);
  font-size: 10px;
  letter-spacing: 0.04em;
}

.math-notice {
  min-height: 16px;
  margin: 16px 0 0;
  color: rgba(102, 70, 77, 0.68);
  font-size: 10px;
  letter-spacing: 0.06em;
}

.math-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 12px;
}

.math-progress span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(190, 152, 150, 0.2);
  transition:
    background 0.4s ease,
    transform 0.4s ease;
}

.math-progress span.is-done,
.math-progress span.is-active {
  background: rgba(195, 116, 129, 0.7);
  box-shadow: 0 0 9px rgba(214, 139, 148, 0.3);
}

.math-progress span.is-active {
  transform: scale(1.35);
}

.math-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 8px 8px;
  text-align: center;
}

.success-hearts {
  position: relative;
  width: 180px;
  height: 27px;
  margin-bottom: 6px;
}

.success-hearts span {
  position: absolute;
  left: calc(var(--heart) * 10% - 9%);
  top: 0;
  color: rgba(211, 130, 145, 0.65);
  font-size: 13px;
  opacity: 0;
  animation: heart-float 2.7s ease-in-out calc(var(--heart) * 0.09s) infinite;
}

.success-eyebrow {
  margin: 8px 0 9px;
  color: rgba(142, 92, 101, 0.62);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.2em;
}

.success-heart {
  color: rgba(199, 111, 132, 0.82);
  font-size: 30px;
  line-height: 1;
  text-shadow:
    0 0 17px rgba(219, 140, 155, 0.34),
    0 0 38px rgba(219, 140, 155, 0.15);
  animation: success-heartbeat 2.5s ease-in-out infinite;
}

.math-success h4 {
  margin: 0;
  color: #744f5b;
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 400;
  letter-spacing: 0.08em;
}

.success-code {
  margin: 9px 0 8px;
  color: rgba(178, 100, 119, 0.72);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 45px;
  letter-spacing: 0.22em;
  line-height: 1;
  animation: code-pulse 2.7s ease-in-out infinite;
}

.success-text {
  max-width: 390px;
  margin: 0 0 9px;
  color: rgba(111, 84, 87, 0.55);
  font-size: 10px;
  letter-spacing: 0.05em;
  line-height: 1.8;
}

.math-love-note {
  max-width: 420px;
  margin: 0 0 17px;
  padding: 8px 13px;
  border: 1px solid rgba(194, 151, 151, 0.2);
  border-radius: 999px;
  color: rgba(137, 84, 97, 0.74);
  background: rgba(252, 237, 234, 0.54);
  font-size: 9px;
  letter-spacing: 0.05em;
  line-height: 1.7;
}

.math-again {
  padding: 8px 16px;
  width: auto;
}

@keyframes wrong-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-6px);
  }
  75% {
    transform: translateX(6px);
  }
}

@keyframes heart-float {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.7) rotate(-8deg);
  }
  25% {
    opacity: 0.85;
  }
  100% {
    opacity: 0;
    transform: translateY(-14px) scale(1.1) rotate(8deg);
  }
}

@keyframes code-pulse {
  0%,
  100% {
    text-shadow: 0 0 0 rgba(199, 119, 135, 0);
  }
  50% {
    text-shadow: 0 0 22px rgba(211, 132, 147, 0.3);
  }
}

@keyframes success-heartbeat {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  42% {
    transform: scale(1.14);
    opacity: 1;
  }
}

.hint-enter-active,
.hint-leave-active,
.math-success-enter-active,
.math-success-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.hint-enter-from,
.hint-leave-to,
.math-success-enter-from,
.math-success-leave-to {
  opacity: 0;
  transform: translateY(7px);
}

@media (max-width: 620px) {
  .math-game {
    padding: 7px 3px 13px;
  }

  .math-top {
    align-items: center;
  }

  .math-code {
    gap: 4px;
  }

  .code-digit {
    width: 29px;
    height: 36px;
    font-size: 18px;
  }

  .math-description {
    margin-bottom: 15px;
  }

  .math-question {
    padding: 18px 15px 16px;
  }

  .question-expression {
    font-size: clamp(30px, 9vw, 43px);
  }

  .math-check {
    min-width: 88px;
  }

  .math-input-row input {
    width: 92px;
  }

  .success-code {
    font-size: 37px;
  }
}
</style>
