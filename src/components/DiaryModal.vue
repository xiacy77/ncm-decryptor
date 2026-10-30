<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { DIARY_ENTRIES, UI } from '@/config/story'

const emit = defineEmits(['close'])
const STORAGE_KEY = 'starlight-diary-v1'

const closeButton = ref(null)
const dateInput = ref(null)
const storedEntries = ref([])
const formOpen = ref(false)
const draftDate = ref(todayValue())
const draftContent = ref('')
const notice = ref('')

// const allEntries = computed(() => {
//   const entries = [...storedEntries.value, ...DIARY_ENTRIES]
//   return entries
//     .filter((entry) => entry && entry.date && entry.content)
//     .sort((a, b) => String(b.date).localeCompare(String(a.date)))
// })
const allEntries = computed(() => {
  const source = [...storedEntries.value, ...DIARY_ENTRIES]
  const topNote = source.find(e => e.isNote === 'top')
  const bottomNote = source.find(e => e.isNote === 'bottom')
  // 中间普通日记：过滤掉头尾寄语，按添加时间倒序（新加写的日记排在上面）
  const normalList = source.filter(e => !e.isNote)
    .filter((entry) => entry && entry.date && entry.content)
    .sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0))

  // 拼接顺序：开篇寄语 → 普通日记列表 → 尾片寄语
  const result = []
  if (topNote) result.push(topNote)
  result.push(...normalList)
  if (bottomNote) result.push(bottomNote)
  return result
})


const canSave = computed(() => Boolean(draftDate.value && draftContent.value.trim()))

function todayValue() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function formatDate(value) {
  const parts = value.split('-')
  if (parts.length !== 3) return value
  return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`
}

function loadEntries() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      storedEntries.value = parsed.filter((entry) => entry?.date && entry?.content)
    }
  } catch {
    storedEntries.value = []
  }
}

function persistEntries() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedEntries.value))
  } catch {
    notice.value = UI.diary.storageError
  }
}

function openForm() {
  formOpen.value = true
  draftDate.value = todayValue()
  draftContent.value = ''
  notice.value = ''
  nextTick(() => dateInput.value?.focus())
}

function cancelForm() {
  formOpen.value = false
  draftContent.value = ''
}

function saveEntry() {
  if (!canSave.value) return
  storedEntries.value.push({
    date: draftDate.value,
    content: draftContent.value.trim(),
    addedAt: Date.now(),
  })
  persistEntries()
  formOpen.value = false
  draftContent.value = ''
  notice.value = UI.diary.saved
  window.setTimeout(() => {
    notice.value = ''
  }, 2600)
}

function requestClose() {
  emit('close')
}

function onKeydown(event) {
  if (event.key === 'Escape') requestClose()
}

onMounted(() => {
  loadEntries()
  closeButton.value?.focus()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="diary-overlay" role="dialog" aria-modal="true" :aria-label="UI.diary.title">
      <div class="diary-wash" aria-hidden="true"></div>

      <button
        ref="closeButton"
        type="button"
        class="diary-close"
        :aria-label="UI.diary.close"
        @click="requestClose"
      >
        <span aria-hidden="true">×</span>
        {{ UI.diary.close }}
      </button>

      <div class="diary-book">
        <header class="diary-header">
          <div>
            <p class="diary-kicker">{{ UI.diary.kicker }}</p>
            <h2 class="diary-title">{{ UI.diary.title }}</h2>
            <p class="diary-subtitle">{{ UI.diary.subtitle }}</p>
          </div>
          <button type="button" class="diary-add" @click="openForm">
            <span class="add-plus" aria-hidden="true">＋</span>
            {{ UI.diary.add }}
          </button>
        </header>

        <Transition name="diary-form">
          <form v-if="formOpen" class="diary-form" @submit.prevent="saveEntry">
            <div class="diary-form-row">
              <label class="diary-field diary-field-date">
                <span>{{ UI.diary.dateLabel }}</span>
                <input
                  ref="dateInput"
                  v-model="draftDate"
                  type="date"
                  required
                />
              </label>
              <span class="diary-form-hint">{{ UI.diary.localHint }}</span>
            </div>

            <label class="diary-field">
              <span>{{ UI.diary.contentLabel }}</span>
              <textarea
                v-model="draftContent"
                rows="5"
                maxlength="1200"
                :placeholder="UI.diary.contentPlaceholder"
                required
              ></textarea>
            </label>

            <div class="diary-form-actions">
              <button type="button" class="diary-text-button" @click="cancelForm">
                {{ UI.diary.cancel }}
              </button>
              <button type="submit" class="diary-save" :disabled="!canSave">
                {{ UI.diary.save }}
              </button>
            </div>
          </form>
        </Transition>

        <div v-if="allEntries.length" class="diary-list">
          <article
            v-for="(entry, index) in allEntries"
            :key="`${entry.date}-${index}-${entry.content.slice(0, 8)}`"
            class="diary-entry"
            :style="{ '--entry-index': index }"
          >
            <span class="diary-tape" aria-hidden="true"></span>
            <p class="diary-date">{{ formatDate(entry.date) }}</p>
            <p class="diary-content">{{ entry.content }}</p>
          </article>
        </div>

        <div v-else class="diary-empty">
          <span class="empty-flower" aria-hidden="true">✿</span>
          <p>{{ UI.diary.empty }}</p>
        </div>

        <Transition name="notice">
          <p v-if="notice" class="diary-notice" role="status">{{ notice }}</p>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.diary-overlay {
  position: fixed;
  inset: 0;
  z-index: 170;
  overflow-y: auto;
  padding: clamp(28px, 6vh, 72px) 18px clamp(28px, 5vh, 60px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: #5a4b51;
  background:
    radial-gradient(ellipse 55% 42% at 52% 8%, rgba(255, 250, 241, 0.96), transparent 75%),
    linear-gradient(155deg, #f9efe5 0%, #f5e2dd 46%, #e9e4dd 100%);
  animation: diary-fade 0.6s ease both;
}

.diary-wash {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.6;
  background:
    radial-gradient(circle at 10% 20%, rgba(228, 188, 195, 0.34), transparent 25%),
    radial-gradient(circle at 90% 14%, rgba(185, 197, 227, 0.3), transparent 28%),
    radial-gradient(circle at 78% 80%, rgba(216, 211, 184, 0.3), transparent 32%);
}

.diary-book {
  position: relative;
  z-index: 1;
  width: min(880px, 94vw);
  min-height: 62vh;
  padding: clamp(25px, 4.5vw, 54px) clamp(22px, 5vw, 62px) clamp(30px, 5vw, 56px);
  border: 1px solid rgba(190, 159, 146, 0.28);
  border-radius: 22px 22px 25px 25px;
  background:
    linear-gradient(90deg, rgba(198, 165, 146, 0.08) 1px, transparent 1px) 0 0 / 28px 28px,
    linear-gradient(rgba(198, 165, 146, 0.06) 1px, transparent 1px) 0 0 / 28px 28px,
    linear-gradient(145deg, rgba(255, 249, 238, 0.9), rgba(249, 235, 222, 0.8));
  box-shadow:
    0 30px 80px rgba(120, 89, 86, 0.18),
    inset 0 0 70px rgba(255, 250, 240, 0.5);
}

.diary-book::before {
  content: '';
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(187, 156, 141, 0.18);
  border-radius: 16px;
  pointer-events: none;
}

.diary-close {
  position: fixed;
  right: max(18px, env(safe-area-inset-right));
  top: calc(18px + env(safe-area-inset-top));
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 0 13px;
  border: 1px solid rgba(170, 138, 128, 0.23);
  border-radius: 999px;
  color: rgba(108, 84, 84, 0.65);
  background: rgba(255, 249, 239, 0.54);
  font-size: 10px;
  backdrop-filter: blur(9px);
}

.diary-close span {
  font-size: 17px;
  font-weight: 200;
  line-height: 1;
}

.diary-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 28px;
}

.diary-kicker {
  margin: 0 0 9px;
  color: rgba(163, 120, 121, 0.5);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 8px;
  letter-spacing: 0.26em;
}

.diary-title {
  margin: 0;
  color: #655055;
  font-family: var(--font-display);
  font-size: clamp(27px, 3.2vw, 40px);
  font-weight: 400;
  letter-spacing: 0.12em;
}

.diary-subtitle {
  margin: 10px 0 0;
  color: rgba(104, 82, 82, 0.55);
  font-size: 11px;
  letter-spacing: 0.06em;
}

.diary-add {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 15px;
  border: 1px solid rgba(193, 139, 147, 0.33);
  border-radius: 999px;
  color: rgba(137, 82, 92, 0.82);
  background: rgba(250, 225, 224, 0.58);
  font-size: 10px;
  transition:
    background 0.3s ease,
    transform 0.3s ease;
}

.diary-add:hover {
  background: rgba(247, 212, 214, 0.8);
  transform: translateY(-2px);
}

.add-plus {
  font-size: 14px;
  line-height: 1;
}

.diary-form {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 28px;
  padding: 18px 18px 16px;
  border: 1px solid rgba(205, 168, 155, 0.28);
  border-radius: 16px;
  background: rgba(255, 250, 241, 0.55);
  box-shadow: inset 0 0 24px rgba(255, 255, 255, 0.3);
}

.diary-form-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 15px;
}

.diary-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: rgba(127, 97, 94, 0.6);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.diary-field-date {
  width: 180px;
}

.diary-field input,
.diary-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(190, 157, 146, 0.27);
  border-radius: 10px;
  outline: none;
  padding: 9px 11px;
  color: #5e4e53;
  background: rgba(255, 252, 245, 0.7);
  font-family: var(--font-body);
  font-size: 12px;
  letter-spacing: 0.03em;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.diary-field textarea {
  resize: vertical;
  min-height: 110px;
  line-height: 1.75;
}

.diary-field input:focus,
.diary-field textarea:focus {
  border-color: rgba(191, 133, 140, 0.55);
  box-shadow: 0 0 0 3px rgba(221, 174, 178, 0.12);
}

.diary-form-hint {
  color: rgba(138, 107, 102, 0.4);
  font-size: 8px;
  letter-spacing: 0.04em;
}

.diary-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.diary-text-button,
.diary-save {
  height: 32px;
  padding: 0 13px;
  border-radius: 999px;
  font-size: 10px;
}

.diary-text-button {
  border: 0;
  color: rgba(124, 98, 96, 0.58);
  background: transparent;
}

.diary-save {
  border: 1px solid rgba(194, 139, 146, 0.3);
  color: rgba(130, 77, 87, 0.85);
  background: rgba(246, 216, 215, 0.66);
}

.diary-save:disabled {
  opacity: 0.4;
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.diary-entry {
  position: relative;
  min-height: 160px;
  padding: 24px 22px 20px;
  border: 1px solid rgba(202, 171, 155, 0.25);
  border-radius: 5px 13px 6px 11px;
  background:
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 27px,
      rgba(181, 148, 129, 0.13) 28px
    ),
    rgba(255, 250, 241, 0.6);
  box-shadow: 0 12px 26px rgba(117, 87, 82, 0.07);
  animation: entry-in 0.8s ease calc(var(--entry-index) * 0.08s) both;
}

.diary-tape {
  position: absolute;
  left: 50%;
  top: -8px;
  width: 50px;
  height: 15px;
  background: rgba(225, 200, 171, 0.45);
  transform: translateX(-50%) rotate(-2deg);
}

.diary-date {
  margin: 0 0 13px;
  color: rgba(155, 115, 111, 0.68);
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 11px;
  letter-spacing: 0.08em;
}

.diary-content {
  margin: 0;
  color: rgba(91, 73, 77, 0.78);
  font-size: 12px;
  letter-spacing: 0.04em;
  line-height: 1.9;
  white-space: pre-wrap;
  word-break: break-word;
}

.diary-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 13vh 0 15vh;
  color: rgba(134, 105, 102, 0.48);
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.05em;
  line-height: 1.9;
}

.empty-flower {
  color: rgba(203, 157, 158, 0.52);
  font-size: 24px;
  animation: empty-float 4.5s ease-in-out infinite;
}

.diary-notice {
  position: sticky;
  bottom: 13px;
  width: max-content;
  max-width: 100%;
  margin: 21px auto 0;
  padding: 8px 15px;
  border: 1px solid rgba(193, 151, 145, 0.25);
  border-radius: 999px;
  color: rgba(126, 91, 91, 0.72);
  background: rgba(255, 249, 239, 0.8);
  font-size: 9px;
  letter-spacing: 0.05em;
  backdrop-filter: blur(8px);
}

@keyframes diary-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes entry-in {
  from {
    opacity: 0;
    transform: translateY(9px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes empty-float {
  0%,
  100% {
    transform: translateY(0) rotate(-4deg);
  }
  50% {
    transform: translateY(-7px) rotate(4deg);
  }
}

.diary-form-enter-active,
.diary-form-leave-active,
.notice-enter-active,
.notice-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.diary-form-enter-from,
.diary-form-leave-to,
.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 700px) {
  .diary-overlay {
    padding: calc(68px + env(safe-area-inset-top)) 11px calc(24px + env(safe-area-inset-bottom));
  }

  .diary-book {
    width: 100%;
    padding: 26px 18px 30px;
  }

  .diary-close {
    top: calc(14px + env(safe-area-inset-top));
    right: 12px;
  }

  .diary-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 21px;
  }

  .diary-title {
    font-size: 27px;
  }

  .diary-add {
    height: 34px;
  }

  .diary-form-row {
    align-items: stretch;
    flex-direction: column;
  }

  .diary-field-date {
    width: 100%;
  }

  .diary-list {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .diary-entry {
    min-height: 130px;
    padding: 21px 18px 17px;
  }

  .diary-empty {
    padding: 17vh 8px;
  }
}
</style>
