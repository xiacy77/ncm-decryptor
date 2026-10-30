<script setup>
defineProps({
  visible: { type: Boolean, default: false },
})
</script>

<template>
  <div class="love-tree" :class="{ 'is-visible': visible }" aria-hidden="true">
    <svg viewBox="0 0 900 760" class="love-tree-svg">
      <defs>
        <radialGradient id="treeGlow" cx="50%" cy="42%" r="52%">
          <stop offset="0%" stop-color="#fffdf6" stop-opacity="0.32" />
          <stop offset="58%" stop-color="#f8eee4" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#f4e8df" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="blossomWhite" cx="38%" cy="30%" r="72%">
          <stop offset="0%" stop-color="#fffdf7" stop-opacity="0.78" />
          <stop offset="58%" stop-color="#f9efe3" stop-opacity="0.42" />
          <stop offset="100%" stop-color="#f4e1d8" stop-opacity="0.08" />
        </radialGradient>
        <radialGradient id="blossomPink" cx="35%" cy="26%" r="70%">
          <stop offset="0%" stop-color="#fffbf4" stop-opacity="0.8" />
          <stop offset="62%" stop-color="#f8dde2" stop-opacity="0.44" />
          <stop offset="100%" stop-color="#efd1d9" stop-opacity="0.04" />
        </radialGradient>
        <filter id="treeBlur">
          <feGaussianBlur stdDeviation="2.7" />
        </filter>
        <filter id="treeSoftBlur">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <ellipse cx="450" cy="370" rx="420" ry="330" fill="url(#treeGlow)" />

      <g filter="url(#treeSoftBlur)" opacity="0.5">
        <ellipse cx="326" cy="242" rx="146" ry="108" fill="#fffaf0" opacity="0.36" />
        <ellipse cx="580" cy="226" rx="164" ry="116" fill="#fff9ed" opacity="0.35" />
        <ellipse cx="452" cy="166" rx="152" ry="105" fill="#fffdf6" opacity="0.32" />
        <ellipse cx="386" cy="336" rx="174" ry="108" fill="#fff8ec" opacity="0.27" />
        <ellipse cx="566" cy="340" rx="172" ry="110" fill="#fdf7eb" opacity="0.26" />
        <ellipse cx="452" cy="288" rx="118" ry="96" fill="#fffdf5" opacity="0.3" />
      </g>

      <g
        class="tree-shadow-branches"
        fill="none"
        stroke="rgba(148, 113, 107, 0.24)"
        stroke-linecap="round"
      >
        <path d="M449 704c-3-66 2-129 1-197-2-85-13-146-2-229" stroke-width="24" />
        <path d="M449 528c-39-55-92-86-151-115M449 486c46-49 99-78 160-102M451 402c-63-50-131-74-206-78M454 373c53-54 123-85 208-98" stroke-width="13" />
        <path d="M454 603c-33 17-69 32-107 64M453 605c34 16 67 34 99 66" stroke-width="10" />
      </g>

      <g class="tree-branches" fill="none" stroke="#fffaf0" stroke-linecap="round">
        <path d="M449 704c-3-66 2-129 1-197-2-85-13-146-2-229" stroke-width="18" opacity="0.55" />
        <path d="M449 528c-39-55-92-86-151-115M449 486c46-49 99-78 160-102M451 402c-63-50-131-74-206-78M454 373c53-54 123-85 208-98" stroke-width="9" opacity="0.5" />
        <path d="M454 603c-33 17-69 32-107 64M453 605c34 16 67 34 99 66" stroke-width="7" opacity="0.46" />
      </g>

      <path
        d="M450 362c-18-34-61-34-74 1-13-35-63-35-77 7-14 45 47 86 151 133 104-47 165-88 151-133-14-42-64-42-77-7-13-35-56-35-74-1Z"
        fill="none"
        stroke="rgba(233, 191, 187, 0.36)"
        stroke-width="2.2"
        filter="url(#treeSoftBlur)"
      />

      <g filter="url(#treeBlur)" opacity="0.85">
        <ellipse cx="260" cy="238" rx="104" ry="86" fill="url(#blossomWhite)" />
        <ellipse cx="351" cy="177" rx="128" ry="92" fill="url(#blossomPink)" />
        <ellipse cx="458" cy="143" rx="137" ry="107" fill="url(#blossomWhite)" />
        <ellipse cx="566" cy="177" rx="132" ry="94" fill="url(#blossomPink)" />
        <ellipse cx="653" cy="250" rx="108" ry="87" fill="url(#blossomWhite)" />
        <ellipse cx="389" cy="281" rx="124" ry="97" fill="url(#blossomWhite)" />
        <ellipse cx="514" cy="289" rx="126" ry="100" fill="url(#blossomPink)" />
        <ellipse cx="301" cy="349" rx="106" ry="87" fill="url(#blossomPink)" />
        <ellipse cx="603" cy="356" rx="112" ry="91" fill="url(#blossomWhite)" />
        <ellipse cx="455" cy="389" rx="112" ry="87" fill="url(#blossomWhite)" />
        <ellipse cx="219" cy="292" rx="73" ry="62" fill="url(#blossomWhite)" />
        <ellipse cx="697" cy="309" rx="78" ry="64" fill="url(#blossomPink)" />
        <ellipse cx="335" cy="124" rx="72" ry="62" fill="url(#blossomWhite)" />
        <ellipse cx="585" cy="112" rx="76" ry="61" fill="url(#blossomWhite)" />
      </g>

      <g class="tree-hearts" fill="#e6b8c2" opacity="0.68">
        <path d="M295 205c6-9 17-7 20 1 3-8 14-10 20-1 7 9-2 19-20 30-18-11-27-21-20-30Z" />
        <path d="M610 178c5-7 13-5 15 1 3-6 11-8 15-1 5 7-1 14-15 23-14-9-20-16-15-23Z" />
        <path d="M506 360c7-9 18-6 21 2 3-8 14-11 20-2 7 9-3 20-21 31-19-11-27-22-20-31Z" />
        <path d="M242 353c4-6 11-4 13 1 2-5 9-7 13-1 4 6-1 13-13 20-12-7-17-14-13-20Z" />
        <path d="M676 280c4-6 11-4 13 1 2-5 9-7 13-1 4 6-1 13-13 20-12-7-17-14-13-20Z" />
      </g>

      <g fill="#eac1c5" opacity="0.62">
        <circle cx="330" cy="126" r="4.2" />
        <circle cx="393" cy="197" r="3.2" />
        <circle cx="527" cy="104" r="3.8" />
        <circle cx="617" cy="174" r="3.4" />
        <circle cx="700" cy="248" r="4" />
        <circle cx="244" cy="301" r="3.2" />
        <circle cx="451" cy="64" r="3" />
        <circle cx="581" cy="402" r="3.6" />
        <circle cx="342" cy="367" r="3" />
        <circle cx="653" cy="353" r="2.8" />
      </g>

      <g fill="#fffdf5" opacity="0.58">
        <circle cx="289" cy="164" r="3" />
        <circle cx="476" cy="95" r="2.4" />
        <circle cx="737" cy="303" r="2.8" />
        <circle cx="188" cy="251" r="2.2" />
        <circle cx="451" cy="62" r="2.4" />
        <circle cx="611" cy="410" r="2.1" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.love-tree {
  position: absolute;
  left: 50%;
  top: 3%;
  z-index: 3;
  width: min(94vw, 820px);
  height: min(70vh, 680px);
  transform: translateX(-50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 2.2s ease;
  animation: tree-float 11s ease-in-out infinite;
}

.love-tree-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: blur(0.6px) drop-shadow(0 18px 28px rgba(124, 93, 89, 0.12));
}

.love-tree.is-visible {
  opacity: 0.82;
}

@keyframes tree-float {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-7px);
  }
}

@media (max-width: 760px) {
  .love-tree {
    top: 3%;
    width: 104vw;
    height: 68vh;
    opacity: 0;
  }

  .love-tree.is-visible {
    opacity: 0.76;
  }

  .love-tree-svg {
    filter: blur(0.9px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .love-tree {
    animation: none;
  }
}
</style>
