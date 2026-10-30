<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { ALBUM, COPY, UI, assetUrl } from '@/config/story'

const emit = defineEmits(['close'])

const currentIndex = ref(0)
const direction = ref('next')
const closing = ref(false)
const closeButton = ref(null)
let previousFocus = null
let closeTimer = null

const total = ALBUM.spreads.length
const current = computed(() => ALBUM.spreads[currentIndex.value])
const transitionName = computed(() => `turn-${direction.value}`)
const isFirst = computed(() => currentIndex.value === 0)
const isLast = computed(() => currentIndex.value === total - 1)

const pageLabel = computed(() =>
  `${String(currentIndex.value + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
)

function goTo(index, nextDirection = 'next') {
  if (closing.value || index < 0 || index >= total || index === currentIndex.value) return
  direction.value = nextDirection
  currentIndex.value = index
}

function nextPage() {
  if (isLast.value) return
  goTo(currentIndex.value + 1, 'next')
}

function previousPage() {
  if (isFirst.value) return
  goTo(currentIndex.value - 1, 'prev')
}

function requestClose() {
  if (closing.value) return
  closing.value = true
  closeTimer = setTimeout(() => {
    emit('close')
  }, 720)
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    requestClose()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextPage()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previousPage()
  }
}

onMounted(async () => {
  previousFocus = document.activeElement
  window.addEventListener('keydown', handleKeydown)
  await nextTick()
  closeButton.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (closeTimer) clearTimeout(closeTimer)
  if (previousFocus instanceof HTMLElement) previousFocus.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="album-overlay" :class="{ 'is-closing': closing }" @click.self="requestClose">
      <div
        class="album-book"
        :class="{ 'is-closing': closing }"
        role="dialog"
        aria-modal="true"
        aria-labelledby="album-title"
      >
        <span class="book-ribbon ribbon-left" aria-hidden="true"></span>
        <span class="book-ribbon ribbon-right" aria-hidden="true"></span>

        <header class="book-header">
          <div class="book-title-group">
            <p id="album-title" class="book-title">{{ COPY.albumTitle }}</p>
            <p class="book-subtitle">{{ COPY.albumSubtitle }}</p>
          </div>
          <span class="page-counter">{{ pageLabel }}</span>
        </header>

        <div class="book-stage">
          <button
            type="button"
            class="page-nav nav-prev"
            :disabled="isFirst"
            :aria-label="UI.album.previous"
            @click="previousPage"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m14.8 5.8-6 6.2 6 6.2" />
            </svg>
          </button>

          <Transition :name="transitionName" mode="out-in">
            <div :key="current.id" class="spread">
              <article class="album-page page-left">
                <div class="photo-mat mat-left">
                  <div class="photo-frame">
                    <img
                      :src="assetUrl(current.my.src)"
                      :alt="current.my.alt"
                      loading="eager"
                      draggable="false"
                    />
                    <span class="photo-light" aria-hidden="true"></span>
                  </div>
                  <span class="tape tape-top" aria-hidden="true"></span>
                  <span class="tape tape-bottom" aria-hidden="true"></span>
                </div>
                <div class="page-caption-row">
                  <span class="owner-tag">{{ COPY.pageMy }}</span>
                  <span class="hand-line" aria-hidden="true"></span>
                </div>
              </article>

              <div class="book-spine" aria-hidden="true">
                <span class="spine-stitches"></span>
              </div>

              <article class="album-page page-right">
                <div class="photo-mat mat-right">
                  <div class="photo-frame">
                    <img
                      :src="assetUrl(current.partner.src)"
                      :alt="current.partner.alt"
                      loading="eager"
                      draggable="false"
                    />
                    <span class="photo-light" aria-hidden="true"></span>
                  </div>
                  <span class="tape tape-top" aria-hidden="true"></span>
                  <span class="tape tape-bottom" aria-hidden="true"></span>
                </div>
                <div class="page-caption-row">
                  <span class="owner-tag">{{ COPY.pageYou }}</span>
                  <span class="hand-line" aria-hidden="true"></span>
                </div>
              </article>
            </div>
          </Transition>

          <button
            type="button"
            class="page-nav nav-next"
            :disabled="isLast"
            :aria-label="UI.album.next"
            @click="nextPage"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9.2 5.8 6 6.2-6 6.2" />
            </svg>
          </button>
        </div>

        <footer class="book-footer">
          <div class="spread-copy">
            <p class="spread-date">{{ current.date }}</p>
            <h3 class="spread-title">{{ current.title }}</h3>
            <p class="spread-caption">{{ current.caption }}</p>
          </div>

          <div class="book-actions">
            <div class="page-dots" :aria-label="UI.album.pageDots">
              <button
                v-for="(spread, index) in ALBUM.spreads"
                :key="spread.id"
                type="button"
                class="page-dot"
                :class="{ active: index === currentIndex }"
                :aria-label="UI.album.jumpTo(index + 1)"
                @click="goTo(index, index > currentIndex ? 'next' : 'prev')"
              ></button>
            </div>
            <button
              ref="closeButton"
              type="button"
              class="close-album"
              @click="requestClose"
            >
              {{ COPY.albumClose }}
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.album-overlay {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: grid;
  place-items: center;
  padding: clamp(10px, 3vw, 42px);
  background:
    radial-gradient(ellipse 70% 70% at 50% 50%, rgba(44, 37, 50, 0.2), rgba(29, 24, 33, 0.62)),
    rgba(31, 27, 35, 0.5);
  backdrop-filter: blur(13px) saturate(0.88);
  animation: overlay-in 0.65s ease both;
}

.album-overlay.is-closing {
  animation: overlay-out 0.72s ease both;
}

.album-book {
  position: relative;
  width: min(1060px, 95vw);
  height: min(760px, 89vh);
  display: flex;
  flex-direction: column;
  padding: clamp(16px, 2.2vw, 28px) clamp(16px, 2.4vw, 32px) clamp(12px, 1.8vw, 22px);
  border: 1px solid rgba(255, 251, 242, 0.74);
  border-radius: 22px;
  background:
    radial-gradient(ellipse 75% 28% at 50% 0%, rgba(255, 255, 255, 0.82), transparent 70%),
    linear-gradient(145deg, #f8eee0 0%, #f3e4d1 46%, #eddcc7 100%);
  box-shadow:
    0 48px 110px rgba(24, 17, 27, 0.44),
    0 8px 26px rgba(24, 17, 27, 0.18),
    inset 0 0 0 6px rgba(255, 250, 243, 0.18);
  transform-origin: 50% 92%;
  animation: book-open 0.92s cubic-bezier(0.2, 0.76, 0.24, 1) both;
  overflow: hidden;
}

.album-book::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  opacity: 0.5;
  background-image:
    radial-gradient(circle at 16% 22%, rgba(180, 141, 127, 0.08) 0 1px, transparent 1.5px),
    radial-gradient(circle at 78% 64%, rgba(174, 144, 127, 0.07) 0 1px, transparent 1.5px);
  background-size: 11px 11px, 17px 17px;
  mix-blend-mode: multiply;
}

.album-book.is-closing {
  animation: book-close 0.72s cubic-bezier(0.55, 0.05, 0.8, 0.4) both;
}

.book-ribbon {
  position: absolute;
  top: -8px;
  width: 18px;
  height: 62px;
  background: linear-gradient(180deg, #d9abb6, #c991a1);
  opacity: 0.56;
  z-index: 2;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%);
}

.ribbon-left {
  left: 18%;
}

.ribbon-right {
  right: 17%;
  transform: scaleY(0.72);
  opacity: 0.42;
}

.book-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 2px clamp(10px, 2.1vw, 28px) 12px;
}

.book-title-group {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
}

.book-title {
  margin: 0;
  color: #5f4d50;
  font-family: var(--font-display);
  font-size: clamp(17px, 2vw, 25px);
  letter-spacing: 0.16em;
  line-height: 1.4;
}

.book-subtitle {
  margin: 0;
  color: rgba(109, 90, 90, 0.52);
  font-size: clamp(9px, 0.9vw, 11px);
  letter-spacing: 0.16em;
}

.page-counter {
  padding-top: 5px;
  color: rgba(112, 93, 91, 0.47);
  font-family: 'Georgia', serif;
  font-size: 11px;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.book-stage {
  position: relative;
  min-height: 0;
  flex: 1;
  display: flex;
  align-items: stretch;
  padding: 0 clamp(19px, 3.4vw, 42px);
}

.spread {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 0;
  background:
    linear-gradient(90deg, rgba(248, 237, 223, 0.9), rgba(255, 248, 238, 0.95) 48%, rgba(241, 227, 211, 0.92)),
    #f6ead9;
  border-radius: 8px 8px 12px 12px;
  box-shadow:
    inset 0 0 50px rgba(160, 128, 109, 0.08),
    0 18px 36px rgba(122, 93, 83, 0.09);
  overflow: hidden;
  transform-origin: 50% 60%;
}

.album-page {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(12px, 2.2vw, 26px) clamp(10px, 2.5vw, 34px)
    clamp(8px, 1.2vw, 16px);
}

.page-left {
  background:
    radial-gradient(ellipse 80% 80% at 28% 44%, rgba(255, 252, 245, 0.55), transparent 70%),
    linear-gradient(90deg, rgba(250, 241, 230, 0.92), rgba(248, 236, 221, 0.86));
}

.page-right {
  background:
    radial-gradient(ellipse 72% 75% at 68% 40%, rgba(255, 252, 245, 0.48), transparent 70%),
    linear-gradient(270deg, rgba(246, 233, 217, 0.9), rgba(250, 240, 228, 0.78));
}

.book-spine {
  position: relative;
  flex: 0 0 clamp(16px, 2.4vw, 30px);
  background:
    linear-gradient(
      90deg,
      rgba(156, 123, 105, 0.14),
      rgba(255, 250, 243, 0.36) 45%,
      rgba(133, 99, 87, 0.15)
    );
  box-shadow:
    inset 12px 0 18px rgba(129, 96, 83, 0.07),
    inset -12px 0 18px rgba(129, 96, 83, 0.07);
}

.spine-stitches {
  position: absolute;
  left: 50%;
  top: 9%;
  bottom: 9%;
  width: 1px;
  background: repeating-linear-gradient(
    180deg,
    rgba(129, 101, 89, 0.24) 0 7px,
    transparent 7px 16px
  );
  transform: translateX(-50%);
}

.photo-mat {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(9px, 1.4vw, 17px);
  border-radius: 4px;
  background: linear-gradient(145deg, #fffaf1, #f6e9d8);
  box-shadow:
    0 14px 28px rgba(128, 98, 80, 0.14),
    0 2px 4px rgba(128, 98, 80, 0.08);
  transform: rotate(-1.05deg);
}

.mat-right {
  transform: rotate(1deg);
}

.photo-mat::before {
  content: '';
  position: absolute;
  inset: 7% 7%;
  border: 1px solid rgba(154, 124, 111, 0.12);
  pointer-events: none;
}

.photo-frame {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 2px;
  background: #d8cabb;
  box-shadow: inset 0 0 24px rgba(95, 67, 56, 0.08);
}

.photo-frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}

.photo-light {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.2), transparent 30%),
    radial-gradient(ellipse at center, transparent 52%, rgba(100, 72, 64, 0.08));
  mix-blend-mode: soft-light;
}

.tape {
  position: absolute;
  width: 52px;
  height: 17px;
  background: rgba(237, 218, 184, 0.56);
  box-shadow: 0 2px 5px rgba(126, 99, 75, 0.08);
  opacity: 0.75;
  z-index: 2;
}

.tape-top {
  left: 50%;
  top: -6px;
  transform: translateX(-50%) rotate(-2.4deg);
}

.tape-bottom {
  right: 9%;
  bottom: -5px;
  width: 38px;
  height: 13px;
  transform: rotate(4deg);
  opacity: 0.55;
}

.page-caption-row {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 7px 1px;
}

.owner-tag {
  display: inline-grid;
  place-items: center;
  width: 27px;
  height: 27px;
  border: 1px solid rgba(138, 107, 101, 0.18);
  border-radius: 50%;
  color: rgba(113, 88, 85, 0.7);
  font-size: 11px;
  letter-spacing: 0.02em;
}

.hand-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(143, 111, 103, 0.16), transparent);
}

.page-nav {
  position: absolute;
  top: 50%;
  z-index: 4;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(128, 102, 93, 0.13);
  border-radius: 50%;
  background: rgba(255, 249, 240, 0.6);
  color: rgba(102, 79, 76, 0.66);
  box-shadow: 0 8px 20px rgba(97, 71, 64, 0.1);
  transform: translateY(-50%);
  backdrop-filter: blur(8px);
  transition:
    background 0.3s ease,
    opacity 0.3s ease,
    transform 0.3s ease;
}

.page-nav:hover:not(:disabled) {
  background: rgba(255, 251, 244, 0.9);
  transform: translateY(-50%) scale(1.06);
}

.page-nav:disabled {
  opacity: 0.18;
  cursor: default;
}

.page-nav svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-prev {
  left: 0;
}

.nav-next {
  right: 0;
}

.book-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  padding: clamp(12px, 1.8vw, 20px) clamp(10px, 2.1vw, 28px) 2px;
}

.spread-copy {
  min-width: 0;
}

.spread-date {
  margin: 0 0 3px;
  color: rgba(126, 101, 91, 0.5);
  font-size: 9px;
  letter-spacing: 0.22em;
}

.spread-title {
  margin: 0;
  color: #665153;
  font-family: var(--font-display);
  font-size: clamp(16px, 1.8vw, 22px);
  font-weight: 400;
  letter-spacing: 0.14em;
  line-height: 1.5;
}

.spread-caption {
  margin: 3px 0 0;
  max-width: 650px;
  color: rgba(100, 80, 80, 0.64);
  font-size: clamp(10px, 1.05vw, 12px);
  letter-spacing: 0.055em;
  line-height: 1.8;
}

.book-actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.page-dots {
  display: flex;
  align-items: center;
  gap: 7px;
}

.page-dot {
  width: 5px;
  height: 5px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgba(126, 97, 91, 0.22);
  transition:
    width 0.4s ease,
    background 0.4s ease;
}

.page-dot.active {
  width: 18px;
  background: rgba(169, 121, 130, 0.64);
}

.close-album {
  padding: 8px 17px;
  border: 1px solid rgba(128, 100, 92, 0.16);
  border-radius: 999px;
  color: rgba(99, 77, 75, 0.68);
  background: rgba(255, 250, 241, 0.5);
  font-size: 11px;
  letter-spacing: 0.07em;
  transition:
    color 0.3s ease,
    background 0.3s ease,
    border-color 0.3s ease;
}

.close-album:hover {
  color: #5f494b;
  border-color: rgba(128, 100, 92, 0.28);
  background: rgba(255, 251, 245, 0.82);
}

.turn-next-enter-active,
.turn-next-leave-active,
.turn-prev-enter-active,
.turn-prev-leave-active {
  transition:
    opacity 0.55s ease,
    transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.turn-next-enter-from {
  opacity: 0;
  transform: translateX(5%) rotateY(-4deg);
}

.turn-next-leave-to {
  opacity: 0;
  transform: translateX(-5%) rotateY(4deg);
}

.turn-prev-enter-from {
  opacity: 0;
  transform: translateX(-5%) rotateY(4deg);
}

.turn-prev-leave-to {
  opacity: 0;
  transform: translateX(5%) rotateY(-4deg);
}

@keyframes book-open {
  from {
    opacity: 0;
    transform: translateY(28px) rotateX(-7deg) scale(0.92);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0) scale(1);
    filter: blur(0);
  }
}

@keyframes book-close {
  0% {
    opacity: 1;
    transform: translateY(0) rotateX(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateY(24px) rotateX(8deg) scale(0.88);
    filter: blur(4px);
  }
}

@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes overlay-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (max-width: 760px) {
  .album-overlay {
    padding: 8px;
  }

  .album-book {
    width: 97vw;
    height: min(86vh, 680px);
    padding: 12px 10px 10px;
    border-radius: 17px;
  }

  .book-header {
    padding: 2px 8px 8px;
  }

  .book-title-group {
    gap: 5px;
  }

  .book-subtitle {
    display: none;
  }

  .book-title {
    letter-spacing: 0.08em;
  }

  .book-stage {
    padding: 0 26px;
  }

  .album-page {
    padding: 8px 7px 6px;
  }

  .photo-mat {
    padding: 7px;
  }

  .photo-mat::before {
    inset: 9%;
  }

  .owner-tag {
    width: 22px;
    height: 22px;
    font-size: 9px;
  }

  .page-caption-row {
    padding: 7px 3px 0;
  }

  .page-nav {
    width: 29px;
    height: 29px;
  }

  .page-nav svg {
    width: 14px;
    height: 14px;
  }

  .book-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 8px 8px 0;
  }

  .spread-caption {
    font-size: 9px;
    line-height: 1.65;
    max-width: none;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .book-actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .close-album {
    padding: 6px 13px;
    font-size: 10px;
  }

  .tape {
    width: 36px;
    height: 12px;
  }
}

@media (max-height: 620px) and (min-width: 761px) {
  .album-book {
    height: 94vh;
  }

  .book-subtitle {
    display: none;
  }

  .spread-caption {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
