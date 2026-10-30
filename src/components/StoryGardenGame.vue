<script setup>
import { computed, ref } from 'vue'
import { LOVE_NOTES, MINI_GAMES } from '@/config/story'

const emit = defineEmits(['complete'])
const game = MINI_GAMES.story

const activeId = ref('')
const readIds = ref(new Set())
const finished = ref(false)
const note = ref('')

const activeStory = computed(
  () => game.items.find((item) => item.id === activeId.value) || null,
)

const allRead = computed(() => readIds.value.size >= game.items.length)

function openStory(item) {
  activeId.value = item.id
}

function closeStory() {
  activeId.value = ''
}

function collectStory() {
  if (!activeStory.value) return
  readIds.value = new Set([...readIds.value, activeStory.value.id])
  activeId.value = ''
  if (readIds.value.size >= game.items.length) {
    finished.value = true
    note.value = LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)]
    emit('complete')
  }
}

function restart() {
  activeId.value = ''
  readIds.value = new Set()
  finished.value = false
  note.value = ''
}
</script>

<template>
  <div class="story-garden">
    <header class="story-head">
      <span class="story-kicker">{{ game.en }}</span>
      <h3 class="story-title">{{ game.title }}</h3>
      <p class="story-progress">
        {{ readIds.size }} / {{ game.items.length }}
        <span aria-hidden="true">·</span>
        已读
      </p>
    </header>

    <Transition name="story-panel" mode="out-in">
      <div v-if="finished" key="finish" class="story-finish">
        <span class="finish-mark" aria-hidden="true">✿</span>
        <p class="finish-kicker">THE END, FOR NOW</p>
        <h4>{{ game.finalTitle }}</h4>
        <p>{{ game.finalText }}</p>
        <blockquote>“{{ note }}”</blockquote>
        <button type="button" class="story-again" @click="restart">再读一遍</button>
      </div>

      <article v-else-if="activeStory" :key="activeStory.id" class="story-reader">
        <button type="button" class="reader-back" @click="closeStory">
          <span aria-hidden="true">←</span>
          回到书架
        </button>
        <p class="reader-kind">{{ activeStory.kind }}</p>
        <h4 class="reader-title">{{ activeStory.title }}</h4>
        <p class="reader-author">{{ activeStory.author }}</p>
        <blockquote class="reader-quote">{{ activeStory.excerpt }}</blockquote>
        <p class="reader-note">{{ activeStory.note }}</p>
        <button type="button" class="reader-collect" @click="collectStory">
          收下这段
          <span aria-hidden="true">✦</span>
        </button>
      </article>

      <div v-else key="shelf" class="story-shelf">
        <button
          v-for="(item, index) in game.items"
          :key="item.id"
          type="button"
          class="story-book"
          :class="{ 'is-read': readIds.has(item.id) }"
          :style="{ '--book-index': index }"
          @click="openStory(item)"
        >
          <span class="book-kind">{{ item.kind }}</span>
          <span class="book-title">{{ item.title }}</span>
          <span class="book-author">{{ item.author }}</span>
          <span class="book-line" aria-hidden="true"></span>
          <span class="book-status">{{ readIds.has(item.id) ? '已读' : '翻开' }}</span>
        </button>
      </div>
    </Transition>

    <p v-if="!finished && !activeStory && allRead" class="story-hint">
      所有故事都读完了，翻到最后一页看看吧。
    </p>
  </div>
</template>

<style scoped>
.story-garden {
  position: relative;
  color: #58464c;
}

.story-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 2px 2px 13px;
  border-bottom: 1px solid rgba(175, 139, 132, 0.18);
}

.story-kicker {
  color: rgba(143, 103, 101, 0.46);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.2em;
}

.story-title {
  margin: 0;
  color: #654c54;
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 400;
  letter-spacing: 0.1em;
}

.story-progress {
  margin: 0 0 0 auto;
  color: rgba(126, 96, 96, 0.45);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 9px;
  letter-spacing: 0.08em;
}

.story-shelf {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 11px;
  padding-top: 17px;
}

.story-book {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 138px;
  padding: 12px 14px 11px;
  overflow: hidden;
  border: 1px solid rgba(180, 144, 136, 0.25);
  border-radius: 14px;
  color: #5d4850;
  background:
    radial-gradient(circle at 82% 14%, rgba(255, 255, 255, 0.58), transparent 34%),
    linear-gradient(148deg, rgba(255, 251, 243, 0.84), rgba(238, 219, 211, 0.62));
  text-align: left;
  animation: book-in 0.8s ease calc(0.1s + var(--book-index) * 0.07s) both;
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease,
    border-color 0.35s ease;
}

.story-book:nth-child(2n) {
  background:
    radial-gradient(circle at 80% 18%, rgba(255, 255, 255, 0.56), transparent 34%),
    linear-gradient(148deg, rgba(255, 251, 243, 0.84), rgba(230, 225, 209, 0.66));
}

.story-book:nth-child(3n) {
  background:
    radial-gradient(circle at 80% 18%, rgba(255, 255, 255, 0.56), transparent 34%),
    linear-gradient(148deg, rgba(255, 251, 243, 0.84), rgba(229, 224, 241, 0.64));
}

.story-book:hover {
  transform: translateY(-4px);
  border-color: rgba(192, 141, 143, 0.45);
  box-shadow: 0 12px 24px rgba(112, 80, 82, 0.11);
}

.story-book.is-read {
  opacity: 0.62;
}

.book-kind {
  color: rgba(161, 111, 111, 0.56);
  font-size: 8px;
  letter-spacing: 0.14em;
}

.book-title {
  margin-top: 16px;
  color: #59434b;
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: 0.08em;
}

.book-author {
  margin-top: 4px;
  color: rgba(118, 88, 88, 0.52);
  font-size: 8px;
  letter-spacing: 0.04em;
}

.book-line {
  width: 28px;
  height: 1px;
  margin-top: auto;
  background: rgba(170, 122, 120, 0.36);
}

.book-status {
  position: absolute;
  right: 12px;
  bottom: 11px;
  color: rgba(125, 81, 86, 0.58);
  font-size: 8px;
  letter-spacing: 0.08em;
}

.story-reader {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 12px 8px;
  text-align: center;
  animation: story-in 0.55s ease both;
}

.reader-back {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
  padding: 5px 9px;
  border: 1px solid rgba(170, 136, 128, 0.18);
  border-radius: 999px;
  color: rgba(114, 84, 85, 0.58);
  background: rgba(255, 250, 242, 0.42);
  font-size: 8px;
}

.reader-kind {
  margin: 8px 0 0;
  color: rgba(161, 111, 111, 0.62);
  font-size: 8px;
  letter-spacing: 0.18em;
}

.reader-title {
  margin: 7px 0 0;
  color: #5e444d;
  font-family: var(--font-display);
  font-size: clamp(25px, 3vw, 34px);
  font-weight: 400;
  letter-spacing: 0.12em;
}

.reader-author {
  margin: 6px 0 0;
  color: rgba(119, 90, 87, 0.55);
  font-size: 9px;
  letter-spacing: 0.08em;
}

.reader-quote {
  max-width: 560px;
  margin: 23px auto 0;
  color: #5d4741;
  font-family: 'Georgia', 'Songti SC', 'SimSun', serif;
  font-size: clamp(17px, 2vw, 22px);
  line-height: 2;
  white-space: pre-line;
}

.reader-note {
  max-width: 480px;
  margin: 16px auto 0;
  color: rgba(113, 84, 82, 0.62);
  font-size: 11px;
  line-height: 1.9;
}

.reader-collect {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 20px;
  padding: 9px 19px;
  border: 1px solid rgba(184, 139, 133, 0.32);
  border-radius: 999px;
  color: rgba(135, 83, 91, 0.82);
  background: rgba(255, 250, 242, 0.64);
  font-size: 10px;
  letter-spacing: 0.08em;
  transition:
    background 0.3s ease,
    transform 0.3s ease;
}

.reader-collect:hover {
  background: rgba(255, 252, 246, 0.94);
  transform: translateY(-1px);
}

.story-finish {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px 20px;
  text-align: center;
  animation: story-in 0.7s ease both;
}

.finish-mark {
  color: rgba(194, 139, 144, 0.7);
  font-size: 30px;
}

.finish-kicker {
  margin: 9px 0 0;
  color: rgba(158, 112, 111, 0.5);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.22em;
}

.story-finish h4 {
  margin: 8px 0 0;
  color: #5e444d;
  font-family: var(--font-display);
  font-size: 27px;
  font-weight: 400;
  letter-spacing: 0.1em;
}

.story-finish > p:not(.finish-kicker) {
  max-width: 520px;
  margin: 13px auto 0;
  color: rgba(103, 77, 78, 0.7);
  font-size: 11px;
  line-height: 1.9;
}

.story-finish blockquote {
  max-width: 500px;
  margin: 20px auto 0;
  color: rgba(116, 75, 82, 0.75);
  font-family: 'Georgia', 'Songti SC', 'SimSun', serif;
  font-size: 13px;
  line-height: 1.9;
}

.story-again {
  margin-top: 20px;
  padding: 8px 18px;
  border: 1px solid rgba(184, 139, 133, 0.3);
  border-radius: 999px;
  color: rgba(135, 83, 91, 0.8);
  background: rgba(255, 250, 242, 0.6);
  font-size: 9px;
}

.story-hint {
  margin: 13px 0 0;
  color: rgba(137, 101, 99, 0.44);
  font-size: 9px;
  text-align: center;
}

.story-panel-enter-active,
.story-panel-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.story-panel-enter-from,
.story-panel-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@keyframes book-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes story-in {
  from {
    opacity: 0;
    transform: translateY(7px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 760px) {
  .story-head {
    gap: 7px;
    padding-bottom: 10px;
  }

  .story-title {
    font-size: 21px;
  }

  .story-shelf {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding-top: 12px;
  }

  .story-book {
    min-height: 112px;
    padding: 10px 11px 10px;
  }

  .book-title {
    margin-top: 10px;
    font-size: 17px;
  }

  .book-author {
    font-size: 7px;
  }

  .book-status {
    right: 9px;
    bottom: 9px;
    font-size: 7px;
  }

  .reader-quote {
    margin-top: 17px;
    font-size: 16px;
    line-height: 1.9;
  }

  .reader-note {
    font-size: 10px;
  }

  .story-finish {
    padding-top: 20px;
  }
}
</style>
