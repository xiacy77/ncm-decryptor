<script setup>
import { computed, inject, ref } from 'vue'
import { LOVE_NOTES, MINI_GAMES, UI } from '@/config/story'
import { AUDIO_KEY } from '@/keys'

const emit = defineEmits(['complete'])
const audio = inject(AUDIO_KEY, null)
const game = MINI_GAMES.chemistry

function buildRound() {
  const always = game.pairs.filter((pair) => pair.always)
  const extras = game.pairs.filter((pair) => !pair.always)
  const shuffledExtras = shuffle(extras)
  return shuffle([...always, ...shuffledExtras.slice(0, Math.max(0, 6 - always.length))])
}

function shuffle(list) {
  const result = [...list]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swap]] = [result[swap], result[index]]
  }
  return result
}

const activePairs = ref(buildRound())
const names = ref(shuffle(activePairs.value))
const selectedSymbol = ref(null)
const matchedSymbols = ref([])
const wrongSymbol = ref('')
const wrongName = ref('')
const notice = ref(UI.play.chemistrySelect)
const finished = ref(false)
const successNote = ref('')

const progress = computed(() => matchedSymbols.value.length / activePairs.value.length)
const selectionReady = computed(() => Boolean(selectedSymbol.value))

function isMatched(symbol) {
  return matchedSymbols.value.includes(symbol)
}

function selectSymbol(pair) {
  if (isMatched(pair.symbol) || finished.value) return
  selectedSymbol.value = pair
  wrongSymbol.value = ''
  wrongName.value = ''
  notice.value = UI.play.chemistrySelect
}

function selectName(pair) {
  if (!selectedSymbol.value || isMatched(pair.symbol) || finished.value) return
  if (selectedSymbol.value.symbol === pair.symbol) {
    matchedSymbols.value = [...matchedSymbols.value, pair.symbol]
    selectedSymbol.value = null
    wrongSymbol.value = ''
    wrongName.value = ''
    notice.value = UI.play.chemistrySelect
    if (matchedSymbols.value.length === activePairs.value.length) {
      finished.value = true
      notice.value = UI.play.chemistrySuccess
      successNote.value = LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)]
      audio?.playChime()
      emit('complete')
    }
  } else {
    wrongSymbol.value = selectedSymbol.value.symbol
    wrongName.value = pair.symbol
    notice.value = UI.play.chemistryWrong
    selectedSymbol.value = null
    window.setTimeout(() => {
      wrongSymbol.value = ''
      wrongName.value = ''
    }, 460)
  }
}

function reset() {
  activePairs.value = buildRound()
  names.value = shuffle(activePairs.value)
  selectedSymbol.value = null
  matchedSymbols.value = []
  wrongSymbol.value = ''
  wrongName.value = ''
  notice.value = UI.play.chemistrySelect
  successNote.value = ''
  finished.value = false
}
</script>

<template>
  <div class="element-game" :class="{ 'is-finished': finished }">
    <div class="element-heading">
      <div>
        <p class="element-kicker">{{ game.en }}</p>
        <h3>{{ game.title }}</h3>
      </div>
      <p class="element-progress" role="status">
        {{ UI.play.chemistryProgress(matchedSymbols.length, activePairs.length) }}
      </p>
    </div>

    <template v-if="!finished">
      <div class="element-columns">
        <section class="element-group" :aria-label="UI.play.symbolLabel">
          <p class="group-label">{{ UI.play.symbolLabel }}</p>
          <div class="element-symbols">
            <button
              v-for="pair in activePairs"
              :key="`symbol-${pair.symbol}`"
              type="button"
              class="element-button symbol-button"
              :class="{
                'is-selected': selectedSymbol?.symbol === pair.symbol,
                'is-matched': isMatched(pair.symbol),
                'is-wrong': wrongSymbol === pair.symbol,
              }"
              :disabled="isMatched(pair.symbol)"
              :aria-pressed="selectedSymbol?.symbol === pair.symbol"
              @click="selectSymbol(pair)"
            >
              <span class="symbol">{{ pair.symbol }}</span>
              <span class="atomic-dot" aria-hidden="true"></span>
            </button>
          </div>
        </section>

        <span class="element-connector" aria-hidden="true">
          <span></span>
          <span class="connector-heart">♥</span>
          <span></span>
        </span>

        <section class="element-group" :aria-label="UI.play.nameLabel">
          <p class="group-label">{{ UI.play.nameLabel }}</p>
          <div class="element-names">
            <button
              v-for="pair in names"
              :key="`name-${pair.symbol}`"
              type="button"
              class="element-button name-button"
              :class="{
                'is-matched': isMatched(pair.symbol),
                'is-wrong': wrongName === pair.symbol,
                'is-ready': selectionReady,
              }"
              :disabled="isMatched(pair.symbol)"
              @click="selectName(pair)"
            >
              {{ pair.name }}
            </button>
          </div>
        </section>
      </div>

      <div class="element-meter" aria-hidden="true">
        <span class="meter-heart" :style="{ width: `${Math.max(progress * 100, 3)}%` }"></span>
      </div>

      <p class="element-notice" role="status">{{ notice }}</p>
    </template>

    <Transition name="element-success">
      <div v-if="finished" class="element-success">
        <div class="formula-cloud" aria-hidden="true">
          <span>Mg</span><i>+</i><span>Zn</span><i>=</i><span>♥</span>
        </div>
        <p class="success-eyebrow">{{ UI.play.chemistrySuccess }}</p>
        <h4>{{ game.successTitle }}</h4>
        <p class="success-text">{{ game.successText }}</p>
        <p class="element-love-note">“{{ successNote }}”</p>
        <button type="button" class="element-again" @click="reset">
          {{ UI.play.chemistryAgain }}
        </button>
      </div>
    </Transition>

    <div v-if="!finished" class="element-footer">
      <span class="mini-element">H</span>
      <span class="mini-element">O</span>
      <span class="mini-element">C</span>
      <span class="mini-line"></span>
      <span class="mini-element is-warm">Mg</span>
      <i class="mini-plus">+</i>
      <span class="mini-element is-warm">Zn</span>
      <span class="mini-caption">{{ UI.play.chemistryCaption }}</span>
    </div>
  </div>
</template>

<style scoped>
.element-game {
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 8px 8px 16px;
  color: #513f46;
}

.element-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.element-kicker {
  margin: 0 0 7px;
  color: rgba(159, 112, 119, 0.52);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.19em;
}

.element-heading h3 {
  margin: 0;
  color: #665157;
  font-family: var(--font-display);
  font-size: clamp(23px, 3vw, 33px);
  font-weight: 400;
  letter-spacing: 0.11em;
}

.element-progress {
  margin: 0 0 4px;
  color: rgba(121, 80, 85, 0.66);
  font-size: 10px;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.element-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr);
  gap: 11px;
  align-items: center;
  margin-top: 15px;
}

.element-group {
  min-width: 0;
}

.group-label {
  margin: 0 0 8px;
  color: rgba(127, 92, 93, 0.6);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.12em;
}

.element-symbols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.element-names {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.element-button {
  position: relative;
  min-width: 0;
  min-height: 48px;
  border: 1px solid rgba(173, 133, 132, 0.36);
  border-radius: 10px;
  color: rgba(82, 62, 68, 0.86);
  background:
    radial-gradient(circle at 28% 20%, rgba(255, 255, 255, 0.6), transparent 40%),
    rgba(255, 249, 240, 0.75);
  box-shadow: inset 0 0 14px rgba(255, 255, 255, 0.22);
  transition:
    transform 0.28s ease,
    border-color 0.28s ease,
    background 0.28s ease,
    color 0.28s ease,
    opacity 0.28s ease;
}

.element-button:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(193, 137, 145, 0.48);
}

.element-button:disabled {
  cursor: default;
}

.symbol-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.symbol {
  font-size: 18px;
  letter-spacing: 0.02em;
}

.atomic-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(198, 148, 147, 0.46);
}

.name-button {
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 0.09em;
}

.element-button.is-selected {
  border-color: rgba(181, 111, 124, 0.64);
  color: rgba(143, 76, 91, 0.9);
  background: rgba(249, 218, 220, 0.74);
  transform: translateY(-2px);
  box-shadow: 0 7px 15px rgba(181, 121, 127, 0.12);
}

.element-button.is-ready:not(.is-matched) {
  border-color: rgba(196, 151, 147, 0.4);
}

.element-button.is-matched {
  color: rgba(132, 105, 100, 0.45);
  border-color: rgba(190, 170, 154, 0.28);
  background:
    radial-gradient(circle at 50% 40%, rgba(255, 245, 225, 0.5), transparent 65%),
    rgba(237, 225, 211, 0.35);
  opacity: 0.8;
}

.element-button.is-matched::after {
  content: '♥';
  position: absolute;
  right: 6px;
  top: 4px;
  color: rgba(196, 124, 136, 0.62);
  font-size: 8px;
}

.element-button.is-wrong {
  border-color: rgba(201, 101, 118, 0.6);
  animation: element-wrong 0.35s ease;
}

.element-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-top: 24px;
  color: rgba(183, 138, 135, 0.42);
}

.element-connector > span:not(.connector-heart) {
  width: 14px;
  height: 1px;
  background: rgba(188, 151, 144, 0.22);
}

.connector-heart {
  font-size: 11px;
}

.element-meter {
  width: 100%;
  height: 3px;
  margin-top: 18px;
  border-radius: 999px;
  background: rgba(185, 148, 142, 0.14);
  overflow: hidden;
}

.meter-heart {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(214, 157, 167, 0.7), rgba(187, 148, 211, 0.62));
  transition: width 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.element-notice {
  min-height: 16px;
  margin: 10px 0 0;
  color: rgba(101, 70, 77, 0.68);
  font-size: 10px;
  letter-spacing: 0.05em;
}

.element-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 17px;
  color: rgba(145, 108, 106, 0.36);
}

.mini-element {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 9px;
}

.mini-element.is-warm {
  color: rgba(184, 116, 128, 0.58);
}

.mini-plus {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  font-style: normal;
}

.mini-line {
  width: 13px;
  height: 1px;
  margin: 0 2px;
  background: rgba(186, 149, 141, 0.18);
}

.mini-caption {
  margin-left: 3px;
  font-size: 7px;
  letter-spacing: 0.07em;
}

.element-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 9px 8px 8px;
  text-align: center;
}

.formula-cloud {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: rgba(172, 101, 117, 0.6);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 16px;
}

.formula-cloud span:nth-child(1),
.formula-cloud span:nth-child(3) {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(192, 145, 149, 0.32);
  border-radius: 9px;
  background: rgba(255, 250, 241, 0.52);
  animation: formula-float 4s ease-in-out infinite;
}

.formula-cloud span:nth-child(3) {
  animation-delay: -1.3s;
}

.formula-cloud span:nth-child(5) {
  color: rgba(199, 111, 133, 0.8);
  font-size: 21px;
  animation: formula-heart 2.3s ease-in-out infinite;
}

.formula-cloud i {
  color: rgba(150, 113, 111, 0.43);
  font-style: normal;
  font-size: 11px;
}

.success-eyebrow {
  margin: 0 0 9px;
  color: rgba(166, 115, 121, 0.55);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.2em;
}

.element-success h4 {
  margin: 0;
  color: #744f5b;
  font-family: var(--font-display);
  font-size: clamp(23px, 3.2vw, 35px);
  font-weight: 400;
  letter-spacing: 0.05em;
}

.success-text {
  max-width: 410px;
  margin: 12px 0 9px;
  color: rgba(111, 84, 87, 0.55);
  font-size: 10px;
  letter-spacing: 0.04em;
  line-height: 1.85;
}

.element-love-note {
  max-width: 430px;
  margin: 0 0 17px;
  padding: 8px 13px;
  border: 1px solid rgba(186, 156, 149, 0.22);
  border-radius: 999px;
  color: rgba(119, 84, 91, 0.72);
  background: rgba(250, 239, 229, 0.58);
  font-size: 9px;
  letter-spacing: 0.04em;
  line-height: 1.7;
}

.element-again {
  padding: 8px 16px;
  border: 1px solid rgba(193, 139, 147, 0.3);
  border-radius: 999px;
  color: rgba(130, 78, 89, 0.82);
  background: rgba(246, 215, 215, 0.6);
  font-size: 9px;
}

@keyframes element-wrong {
  0%,
  100% {
    transform: translateX(0);
  }
  30% {
    transform: translateX(-5px);
  }
  70% {
    transform: translateX(5px);
  }
}

@keyframes formula-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes formula-heart {
  0%,
  100% {
    transform: scale(1);
    text-shadow: 0 0 0 rgba(206, 130, 146, 0);
  }
  50% {
    transform: scale(1.18);
    text-shadow: 0 0 18px rgba(206, 130, 146, 0.32);
  }
}

.element-success-enter-active,
.element-success-leave-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
}

.element-success-enter-from,
.element-success-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 620px) {
  .element-game {
    padding: 4px 2px 12px;
  }

  .element-heading {
    align-items: flex-start;
  }

  .element-description {
    margin-bottom: 14px;
  }

  .element-columns {
    grid-template-columns: minmax(0, 1fr) 16px minmax(0, 1fr);
    gap: 6px;
  }

  .element-symbols {
    gap: 5px;
  }

  .element-names {
    gap: 5px;
  }

  .element-button {
    min-height: 42px;
  }

  .symbol {
    font-size: 16px;
  }

  .name-button {
    font-size: 12px;
  }

  .element-connector {
    gap: 3px;
  }

  .connector-heart {
    font-size: 9px;
  }

  .mini-caption {
    display: none;
  }

  .element-footer {
    gap: 3px;
  }

  .success-text {
    max-width: 300px;
  }
}
</style>
