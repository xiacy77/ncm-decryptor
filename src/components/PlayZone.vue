<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ElementLoveGame from '@/components/ElementLoveGame.vue'
import HeartMathGame from '@/components/HeartMathGame.vue'
import QuizGame from '@/components/QuizGame.vue'
import StoryGardenGame from '@/components/StoryGardenGame.vue'
import { MINI_GAMES, UI } from '@/config/story'

const emit = defineEmits(['close'])

const closeButton = ref(null)
const activeGame = ref('')

const gameList = [
  MINI_GAMES.math,
  MINI_GAMES.chemistry,
  MINI_GAMES.quiz,
  MINI_GAMES.story,
]
const currentGame = computed(() => MINI_GAMES[activeGame.value] || null)

function selectGame(id) {
  activeGame.value = id
}

function backToSelection() {
  activeGame.value = ''
}

function requestClose() {
  emit('close')
}

function onKeydown(event) {
  if (event.key !== 'Escape') return
  if (activeGame.value) backToSelection()
  else requestClose()
}

onMounted(() => {
  closeButton.value?.focus()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="play-overlay" role="dialog" aria-modal="true" :aria-label="UI.play.title">
      <div class="play-wash" aria-hidden="true"></div>

      <button
        ref="closeButton"
        type="button"
        class="play-close"
        :aria-label="UI.play.close"
        @click="requestClose"
      >
        <span aria-hidden="true">×</span>
        {{ UI.play.close }}
      </button>

      <div class="play-shell">
        <Transition name="play-mode" mode="out-in">
          <div v-if="!activeGame" key="select" class="play-select">
            <header class="play-header">
              <h2 class="play-title">{{ UI.play.title }}</h2>
              <p class="play-subtitle">{{ UI.play.subtitle }}</p>
            </header>

            <div class="game-grid">
              <button
                v-for="(game, index) in gameList"
                :key="game.id"
                type="button"
                class="game-card"
                :class="`game-card-${game.id}`"
                :style="{ '--card-index': index }"
                @click="selectGame(game.id)"
              >
                <span class="game-card-top">
                  <span class="game-index">{{ game.index }}</span>
                </span>
                <span class="game-visual" aria-hidden="true">
                  <template v-if="game.id === 'math'">
                    <span class="visual-formula">x · y · ?</span>
                  </template>
                  <template v-else-if="game.id === 'chemistry'">
                    <span class="visual-element">H</span>
                    <span class="visual-plus">·</span>
                    <span class="visual-element">O</span>
                    <span class="visual-plus">·</span>
                    <span class="visual-element">C</span>
                  </template>
                  <template v-else-if="game.id === 'story'">
                    <span class="visual-story">❦</span>
                    <span class="story-spark story-spark-a"></span>
                    <span class="story-spark story-spark-b"></span>
                  </template>
                  <template v-else>
                    <span class="visual-quiz">?</span>
                    <span class="quiz-dot dot-one"></span>
                    <span class="quiz-dot dot-two"></span>
                    <span class="quiz-dot dot-three"></span>
                  </template>
                </span>
                <span class="game-card-title">{{ game.title }}</span>
                <span class="game-play">
                  {{ UI.play.start }}
                  <span aria-hidden="true">↗</span>
                </span>
              </button>
            </div>
          </div>

          <div v-else key="game" class="play-game-view">
            <div class="play-game-bar">
              <button type="button" class="play-back" @click="backToSelection">
                <span aria-hidden="true">←</span>
                {{ UI.play.back }}
              </button>
              <span class="play-game-index">{{ currentGame.index }}</span>
            </div>

            <div class="play-game-panel">
              <HeartMathGame v-if="activeGame === 'math'" />
              <ElementLoveGame v-else-if="activeGame === 'chemistry'" />
              <QuizGame v-else-if="activeGame === 'quiz'" />
              <StoryGardenGame v-else />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.play-overlay {
  position: fixed;
  inset: 0;
  z-index: 165;
  overflow: hidden;
  color: #5d4c51;
  background:
    radial-gradient(ellipse 55% 45% at 50% 0%, rgba(255, 250, 241, 0.8), transparent 72%),
    linear-gradient(158deg, #eeded5 0%, #e6cfd2 48%, #cbd6c7 100%);
  animation: play-fade 0.55s ease both;
}

.play-wash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 10% 22%, rgba(215, 155, 174, 0.34), transparent 28%),
    radial-gradient(circle at 88% 16%, rgba(161, 178, 220, 0.36), transparent 31%),
    radial-gradient(circle at 80% 86%, rgba(181, 200, 164, 0.34), transparent 33%);
}

.play-close {
  position: fixed;
  top: calc(16px + env(safe-area-inset-top));
  right: max(18px, env(safe-area-inset-right));
  z-index: 12;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 35px;
  padding: 0 12px;
  border: 1px solid rgba(159, 128, 119, 0.22);
  border-radius: 999px;
  color: rgba(104, 80, 82, 0.7);
  background: rgba(255, 249, 239, 0.58);
  box-shadow: 0 6px 17px rgba(95, 72, 74, 0.07);
  font-size: 9px;
  backdrop-filter: blur(10px);
  outline: none;
  transition:
    background 0.3s ease,
    transform 0.3s ease;
}

.play-close:focus-visible {
  outline: 1px solid rgba(184, 137, 137, 0.48);
  outline-offset: 2px;
}

.play-close:hover {
  background: rgba(255, 250, 241, 0.88);
  transform: translateY(-1px);
}

.play-close span {
  font-size: 16px;
  line-height: 1;
}

.play-shell {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: clamp(24px, 4.5vh, 48px) 20px calc(30px + env(safe-area-inset-bottom));
}

.play-select,
.play-game-view {
  width: min(970px, 100%);
  margin: 0 auto;
}

.play-select {
  padding-top: clamp(12px, 4vh, 46px);
}

.play-header {
  text-align: center;
}

.play-title {
  margin: 0;
  color: #634e54;
  font-family: var(--font-display);
  font-size: clamp(32px, 4.4vw, 52px);
  font-weight: 400;
  letter-spacing: 0.16em;
}

.play-subtitle {
  margin: 12px auto 0;
  max-width: 320px;
  color: rgba(91, 68, 72, 0.62);
  font-size: 10px;
  letter-spacing: 0.06em;
  line-height: 1.8;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: clamp(30px, 6vh, 60px);
}

.game-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 265px;
  padding: 17px 19px 19px;
  overflow: hidden;
  border: 1px solid rgba(175, 133, 132, 0.34);
  border-radius: 19px;
  color: #513f46;
  background:
    radial-gradient(circle at 78% 20%, rgba(255, 255, 255, 0.62), transparent 32%),
    linear-gradient(150deg, rgba(255, 250, 241, 0.88), rgba(239, 214, 213, 0.72));
  box-shadow:
    0 14px 32px rgba(91, 65, 69, 0.11),
    inset 0 0 32px rgba(255, 255, 255, 0.24);
  text-align: left;
  transition:
    transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 0.45s ease,
    border-color 0.45s ease;
  animation: card-in 0.9s cubic-bezier(0.18, 0.68, 0.28, 1)
    calc(0.18s + var(--card-index) * 0.1s) both;
}

.game-card::after {
  content: '';
  position: absolute;
  right: -34px;
  bottom: -52px;
  width: 150px;
  height: 150px;
  border: 1px solid rgba(190, 151, 147, 0.14);
  border-radius: 50%;
}

.game-card:hover {
  transform: translateY(-6px);
  border-color: rgba(192, 137, 145, 0.48);
  box-shadow:
    0 20px 42px rgba(104, 78, 79, 0.13),
    inset 0 0 32px rgba(255, 255, 255, 0.26);
}

.game-card-chemistry {
  background:
    radial-gradient(circle at 80% 18%, rgba(255, 255, 255, 0.58), transparent 33%),
    linear-gradient(150deg, rgba(255, 250, 241, 0.88), rgba(231, 229, 213, 0.73));
}

.game-card-quiz {
  background:
    radial-gradient(circle at 80% 18%, rgba(255, 255, 255, 0.58), transparent 33%),
    linear-gradient(150deg, rgba(255, 250, 241, 0.88), rgba(225, 224, 242, 0.72));
}

.game-card-story {
  background:
    radial-gradient(circle at 80% 18%, rgba(255, 255, 255, 0.58), transparent 33%),
    linear-gradient(150deg, rgba(255, 250, 241, 0.88), rgba(231, 214, 204, 0.74));
}

.game-card-top {
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: rgba(131, 87, 94, 0.6);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.12em;
}

.game-index {
  font-size: 10px;
}

.game-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: 92px;
  margin: 16px 0 14px;
}

.visual-formula {
  color: rgba(130, 105, 148, 0.68);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 29px;
  letter-spacing: 0.12em;
}

.visual-element {
  display: grid;
  place-items: center;
  width: 37px;
  height: 37px;
  border: 1px solid rgba(168, 174, 147, 0.32);
  border-radius: 8px;
  color: rgba(120, 128, 100, 0.7);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 15px;
}

.visual-plus {
  color: rgba(185, 147, 144, 0.45);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 11px;
}

.visual-quiz {
  color: rgba(139, 112, 164, 0.66);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 52px;
  line-height: 1;
}

.visual-story {
  color: rgba(160, 108, 109, 0.7);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 56px;
  line-height: 1;
  text-shadow: 0 0 18px rgba(208, 162, 156, 0.22);
}

.story-spark {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(187, 143, 132, 0.5);
  box-shadow: 0 0 8px rgba(214, 171, 155, 0.45);
}

.story-spark-a {
  transform: translate(-12px, -18px);
}

.story-spark-b {
  transform: translate(14px, 15px);
}

.quiz-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(191, 154, 170, 0.45);
}

.dot-one {
  transform: translateY(-15px);
}

.dot-three {
  transform: translateY(15px);
}

.game-card-title {
  color: #523f47;
  font-family: var(--font-display);
  font-size: 21px;
  letter-spacing: 0.1em;
}

.game-play {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 17px;
  color: rgba(128, 70, 83, 0.8);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.game-play span {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.game-card:hover .game-play span {
  transform: translateX(3px);
}

.play-game-view {
  padding-top: 38px;
}

.play-game-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(760px, 100%);
  margin: 0 auto 12px;
}

.play-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 11px;
  border: 1px solid rgba(159, 128, 119, 0.2);
  border-radius: 999px;
  color: rgba(104, 80, 82, 0.66);
  background: rgba(255, 249, 239, 0.5);
  font-size: 8px;
  backdrop-filter: blur(9px);
}

.play-back span {
  font-size: 13px;
}

.play-game-index {
  color: rgba(145, 105, 108, 0.42);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 9px;
  letter-spacing: 0.12em;
}

.play-game-panel {
  width: min(760px, 100%);
  max-height: calc(100dvh - 130px);
  margin: 0 auto;
  padding: 19px 21px 21px;
  overflow-y: auto;
  border: 1px solid rgba(190, 151, 145, 0.25);
  border-radius: 20px;
  background:
    linear-gradient(90deg, rgba(180, 142, 130, 0.07) 1px, transparent 1px) 0 0 / 27px 27px,
    linear-gradient(rgba(180, 142, 130, 0.07) 1px, transparent 1px) 0 0 / 27px 27px,
    rgba(255, 250, 242, 0.82);
  box-shadow:
    0 17px 42px rgba(91, 65, 69, 0.13),
    inset 0 0 35px rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(9px);
}

@keyframes play-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.play-mode-enter-active,
.play-mode-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.play-mode-enter-from,
.play-mode-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 820px) {
  .game-grid {
    grid-template-columns: 1fr;
    gap: 11px;
    max-width: 430px;
    margin: 22px auto 0;
  }

  .game-card {
    min-height: 0;
    padding: 13px 15px 15px;
  }

  .game-visual {
    height: 64px;
    margin: 10px 0 9px;
  }

  .visual-formula {
    font-size: 25px;
  }

  .visual-quiz {
    font-size: 42px;
  }

  .visual-story {
    font-size: 46px;
  }

  .play-shell {
    padding: calc(58px + env(safe-area-inset-top)) 12px calc(26px + env(safe-area-inset-bottom));
  }

  .play-select {
    padding-top: 0;
  }

  .play-subtitle {
    max-width: 280px;
    font-size: 9px;
    line-height: 1.75;
  }

  .play-game-view {
    padding-top: 43px;
  }

  .play-game-panel {
    max-height: calc(100dvh - 135px);
    padding: 14px 11px 17px;
  }

  .play-game-bar {
    margin-bottom: 9px;
  }

  .play-close {
    top: calc(14px + env(safe-area-inset-top));
    right: 12px;
    height: 32px;
    padding: 0 10px;
    font-size: 8px;
  }
}
</style>
