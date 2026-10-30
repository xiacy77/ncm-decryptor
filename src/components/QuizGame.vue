<script setup>
import { computed, inject, ref } from 'vue'
import { LOVE_NOTES, MINI_GAMES, UI } from '@/config/story'
import { AUDIO_KEY } from '@/keys'

const emit = defineEmits(['complete'])

const audio = inject(AUDIO_KEY, null)
const game = MINI_GAMES.quiz

function shuffle(list) {
  const result = [...list]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swap]] = [result[swap], result[index]]
  }
  return result
}

function makeQuestion(source) {
  const choices = source.options.map((text, index) => ({
    text,
    correct: index === source.answer,
  }))
  const mixed = shuffle(choices)
  return {
    q: source.q,
    options: mixed.map((item) => item.text),
    answer: mixed.findIndex((item) => item.correct),
  }
}

function pickQuestions() {
  const count = Math.min(game.questionCount, game.questions.length)
  return shuffle(game.questions).slice(0, count).map(makeQuestion)
}

const questions = ref(pickQuestions())
const current = ref(0)
const selected = ref(null)
const answers = ref([])
const locked = ref(false)
const finished = ref(false)
const successNote = ref('')
const score = ref(0)

const question = computed(() => questions.value[current.value] ?? null)
const total = computed(() => questions.value.length)
const maxScore = computed(() => total.value * game.points)
const tier = computed(() => {
  if (!finished.value) return null
  return (
    game.tiers.find((item) => score.value >= item.min) ||
    game.tiers[game.tiers.length - 1]
  )
})
const progress = computed(() => {
  if (!total.value) return 0
  return ((current.value + (finished.value ? 1 : 0)) / total.value) * 100
})

function choose(index) {
  if (locked.value || finished.value) return
  selected.value = index
  answers.value[current.value] = index
  locked.value = true

  window.setTimeout(() => {
    if (current.value >= total.value - 1) {
      finish()
    } else {
      current.value += 1
      selected.value = null
      locked.value = false
    }
  }, 430)
}

function finish() {
  const correct = answers.value.reduce(
    (count, answer, index) =>
      count + (answer === questions.value[index]?.answer ? 1 : 0),
    0,
  )
  score.value = correct * game.points
  successNote.value = LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)]
  finished.value = true
  audio?.playChime()
  emit('complete')
}

function reset() {
  questions.value = pickQuestions()
  answers.value = []
  current.value = 0
  selected.value = null
  locked.value = false
  finished.value = false
  successNote.value = ''
  score.value = 0
}
</script>

<template>
  <div class="quiz-game" :class="{ 'is-finished': finished }">
    <template v-if="!finished">
      <div class="quiz-heading">
        <div>
          <p class="quiz-kicker">{{ game.en }}</p>
          <h3>{{ game.title }}</h3>
        </div>
        <p class="quiz-count">{{ UI.quiz.progress(current + 1, total) }}</p>
      </div>

      <div class="quiz-progress" aria-hidden="true">
        <span :style="{ width: `${progress}%` }"></span>
      </div>

      <div class="quiz-question">
        <p class="quiz-question-index">{{ UI.quiz.progress(current + 1, total) }}</p>
        <h4>{{ question?.q }}</h4>
        <p class="quiz-hint">{{ UI.quiz.choose }}</p>

        <div class="quiz-options">
          <button
            v-for="(option, index) in question?.options"
            :key="`${current}-${index}-${option}`"
            type="button"
            class="quiz-option"
            :class="{ 'is-selected': selected === index }"
            :disabled="locked"
            @click="choose(index)"
          >
            <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
            <span>{{ option }}</span>
          </button>
        </div>
      </div>

      <p class="quiz-points">{{ UI.quiz.pointsHint(game.points) }}</p>
    </template>

    <Transition name="quiz-result">
      <div
        v-if="finished"
        class="quiz-result"
        :class="tier ? `tone-${tier.tone}` : ''"
      >
        <p class="result-kicker">{{ UI.quiz.result }}</p>
        <p class="result-score">
          <strong>{{ score }}</strong>
          <span>/ {{ maxScore }}</span>
        </p>
        <p class="result-label">{{ tier?.label }}</p>
        <h4>{{ tier?.title }}</h4>
        <p class="result-text">{{ tier?.text }}</p>
        <p class="result-note-label">{{ UI.quiz.noteLabel }}</p>
        <p class="result-note">“{{ successNote }}”</p>
        <button type="button" class="quiz-again" @click="reset">
          {{ UI.quiz.again }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.quiz-game {
  position: relative;
  width: 100%;
  max-width: 690px;
  margin: 0 auto;
  padding: 8px 8px 16px;
  color: #513f46;
}

.quiz-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.quiz-kicker {
  margin: 0 0 7px;
  color: rgba(159, 112, 119, 0.52);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.19em;
}

.quiz-heading h3 {
  margin: 0;
  color: #665157;
  font-family: var(--font-display);
  font-size: clamp(23px, 3vw, 33px);
  font-weight: 400;
  letter-spacing: 0.11em;
}

.quiz-count {
  margin: 0 0 4px;
  color: rgba(121, 80, 85, 0.62);
  font-size: 9px;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.quiz-progress {
  width: 100%;
  height: 3px;
  margin-top: 17px;
  border-radius: 999px;
  background: rgba(185, 148, 142, 0.14);
  overflow: hidden;
}

.quiz-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(205, 138, 150, 0.7), rgba(178, 153, 210, 0.62));
  transition: width 0.55s ease;
}

.quiz-question {
  margin-top: 18px;
  padding: 22px 22px 20px;
  border: 1px solid rgba(190, 150, 148, 0.29);
  border-radius: 19px;
  background:
    linear-gradient(90deg, rgba(193, 156, 143, 0.05) 1px, transparent 1px) 0 0 / 26px 26px,
    linear-gradient(rgba(193, 156, 143, 0.05) 1px, transparent 1px) 0 0 / 26px 26px,
    rgba(255, 250, 241, 0.64);
}

.quiz-question-index {
  margin: 0 0 8px;
  color: rgba(130, 92, 94, 0.55);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.quiz-question h4 {
  margin: 0 0 7px;
  color: #5d464f;
  font-family: var(--font-display);
  font-size: clamp(19px, 2.4vw, 27px);
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1.55;
}

.quiz-hint {
  margin: 0 0 16px;
  color: rgba(103, 77, 82, 0.52);
  font-size: 9px;
  letter-spacing: 0.06em;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 46px;
  padding: 8px 11px;
  border: 1px solid rgba(183, 142, 142, 0.3);
  border-radius: 11px;
  color: rgba(83, 62, 69, 0.8);
  background: rgba(255, 250, 242, 0.7);
  font-size: 11px;
  text-align: left;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease,
    color 0.25s ease;
}

.quiz-option:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(188, 124, 135, 0.5);
}

.quiz-option.is-selected {
  border-color: rgba(180, 107, 124, 0.6);
  color: rgba(126, 71, 85, 0.9);
  background: rgba(249, 217, 220, 0.74);
}

.quiz-option:disabled {
  cursor: default;
}

.option-letter {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(189, 144, 144, 0.28);
  border-radius: 50%;
  color: rgba(144, 98, 102, 0.6);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 10px;
}

.quiz-option.is-selected .option-letter {
  border-color: rgba(180, 107, 124, 0.42);
  color: rgba(137, 76, 91, 0.8);
}

.quiz-points {
  margin: 12px 0 0;
  color: rgba(124, 91, 93, 0.42);
  font-size: 8px;
  letter-spacing: 0.06em;
  text-align: center;
}

.quiz-result {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 26px 24px 22px;
  overflow: hidden;
  border: 1px solid rgba(192, 151, 145, 0.3);
  border-radius: 20px;
  background:
    radial-gradient(ellipse 68% 56% at 50% 12%, rgba(255, 255, 255, 0.8), transparent 68%),
    rgba(255, 248, 241, 0.72);
  box-shadow:
    0 17px 40px rgba(102, 77, 80, 0.11),
    inset 0 0 30px rgba(255, 255, 255, 0.24);
  text-align: center;
}

.quiz-result.tone-peach {
  background:
    radial-gradient(ellipse 68% 56% at 50% 12%, rgba(255, 255, 255, 0.8), transparent 68%),
    rgba(255, 244, 233, 0.8);
}

.quiz-result.tone-lavender {
  background:
    radial-gradient(ellipse 68% 56% at 50% 12%, rgba(255, 255, 255, 0.8), transparent 68%),
    rgba(243, 238, 250, 0.82);
}

.quiz-result.tone-sage {
  background:
    radial-gradient(ellipse 68% 56% at 50% 12%, rgba(255, 255, 255, 0.8), transparent 68%),
    rgba(242, 246, 235, 0.82);
}

.result-kicker {
  margin: 0 0 4px;
  color: rgba(153, 108, 112, 0.55);
  font-size: 9px;
  letter-spacing: 0.14em;
}

.result-score {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 0;
  color: #79525f;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.result-score strong {
  font-size: clamp(58px, 9vw, 84px);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.03em;
}

.result-score span {
  color: rgba(135, 99, 102, 0.5);
  font-size: 12px;
}

.result-label {
  margin: 8px 0 8px;
  padding: 4px 10px;
  border: 1px solid rgba(194, 151, 148, 0.25);
  border-radius: 999px;
  color: rgba(141, 86, 98, 0.72);
  background: rgba(255, 250, 243, 0.5);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.quiz-result h4 {
  margin: 0;
  color: #674e56;
  font-family: var(--font-display);
  font-size: clamp(23px, 3.2vw, 34px);
  font-weight: 400;
  letter-spacing: 0.08em;
}

.result-text {
  max-width: 420px;
  margin: 10px 0 18px;
  color: rgba(101, 78, 82, 0.56);
  font-size: 10px;
  letter-spacing: 0.04em;
  line-height: 1.8;
}

.result-note-label {
  margin: 0 0 6px;
  color: rgba(141, 98, 101, 0.4);
  font-size: 7px;
  letter-spacing: 0.12em;
}

.result-note {
  max-width: 430px;
  margin: 0 0 18px;
  padding: 8px 14px;
  border: 1px solid rgba(193, 150, 147, 0.2);
  border-radius: 999px;
  color: rgba(120, 82, 91, 0.72);
  background: rgba(255, 250, 243, 0.56);
  font-size: 9px;
  letter-spacing: 0.04em;
  line-height: 1.7;
}

.quiz-again {
  height: 33px;
  padding: 0 15px;
  border: 1px solid rgba(193, 139, 147, 0.32);
  border-radius: 999px;
  color: rgba(130, 78, 89, 0.82);
  background: rgba(246, 215, 215, 0.64);
  font-size: 9px;
}

.quiz-result-enter-active,
.quiz-result-leave-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
}

.quiz-result-enter-from,
.quiz-result-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 620px) {
  .quiz-game {
    padding: 4px 2px 12px;
  }

  .quiz-heading {
    align-items: flex-start;
  }

  .quiz-question {
    margin-top: 14px;
    padding: 17px 14px 16px;
  }

  .quiz-options {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .quiz-option {
    min-height: 42px;
    font-size: 10px;
  }

  .quiz-result {
    padding: 23px 18px 20px;
  }

  .result-score strong {
    font-size: 60px;
  }

  .quiz-result h4 {
    font-size: 22px;
  }
}
</style>
