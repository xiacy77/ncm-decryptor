<script setup>
defineProps({
  mode: { type: String, default: 'day' },
})

const butterflies = [
  {
    id: 1,
    left: '6%',
    top: '32%',
    scale: 1.08,
    driftX: '22px',
    driftY: '-26px',
    duration: '8.5s',
    delay: '-2s',
    wingA: 'rgba(242, 191, 201, 0.95)',
    wingB: 'rgba(255, 241, 225, 0.82)',
  },
  {
    id: 2,
    left: '93%',
    top: '27%',
    scale: 0.9,
    driftX: '-19px',
    driftY: '21px',
    duration: '10s',
    delay: '-6s',
    wingA: 'rgba(217, 204, 240, 0.92)',
    wingB: 'rgba(255, 246, 228, 0.78)',
  },
  {
    id: 3,
    left: '17%',
    top: '61%',
    scale: 0.76,
    driftX: '26px',
    driftY: '-14px',
    duration: '11.5s',
    delay: '-4.4s',
    wingA: 'rgba(249, 209, 180, 0.9)',
    wingB: 'rgba(235, 203, 218, 0.78)',
  },
  {
    id: 4,
    left: '83%',
    top: '63%',
    scale: 0.66,
    driftX: '-20px',
    driftY: '-18px',
    duration: '12.5s',
    delay: '-1.2s',
    wingA: 'rgba(241, 205, 218, 0.86)',
    wingB: 'rgba(255, 241, 219, 0.74)',
  },
]
</script>

<template>
  <div class="flower-decor" :class="`is-${mode}`" aria-hidden="true">
    <div class="garland garland-left">
      <svg viewBox="0 0 190 350">
        <path
          d="M32 2c20 62 8 112 30 156 18 36 9 82 26 126"
          fill="none"
          stroke="#b08b77"
          stroke-width="1.5"
          stroke-linecap="round"
          opacity=".72"
        />
        <path
          d="M48 57c18-9 35-4 44 10-18 9-34 4-44-10ZM55 103c-16-8-31-2-38 12 16 7 30 1 38-12ZM82 158c17-7 32 1 39 15-17 6-31-1-39-15ZM77 218c-14-9-29-5-37 8 14 9 28 5 37-8ZM104 276c14-4 27 4 31 18-14 3-26-5-31-18Z"
          fill="#a9b99e"
          opacity=".64"
        />
        <g transform="translate(48 88) rotate(-15)">
          <circle r="11" fill="#d49aa4" opacity=".62" />
          <path d="M0-18c9 6 9 17 0 24-9-7-9-18 0-24Z" fill="#edc0c7" />
          <path d="M-17-4c9-6 19-1 22 8-9 6-19 1-22-8Z" fill="#edc0c7" />
          <path d="M17-4c-9-6-19-1-22 8 9 6 19 1 22-8Z" fill="#edc0c7" />
          <circle r="5" fill="#9f6b74" opacity=".5" />
        </g>
        <g transform="translate(91 188) rotate(12)">
          <circle r="9" fill="#d49aa4" opacity=".6" />
          <path d="M0-15c7 5 7 14 0 20-7-6-7-15 0-20Z" fill="#edc0c7" />
          <path d="M-14-3c8-5 16-1 18 7-8 5-16 1-18-7Z" fill="#edc0c7" />
          <path d="M14-3c-8-5-16-1-18 7 8 5 16 1 18-7Z" fill="#edc0c7" />
          <circle r="4" fill="#9f6b74" opacity=".5" />
        </g>
        <g transform="translate(105 295) rotate(-8)">
          <circle r="8" fill="#d49aa4" opacity=".55" />
          <path d="M0-13c6 4 6 12 0 17-6-5-6-13 0-17Z" fill="#edc0c7" />
          <path d="M-12-2c7-4 14-1 16 6-7 4-14 1-16-6Z" fill="#edc0c7" />
          <path d="M12-2c-7-4-14-1-16 6 7 4 14 1 16-6Z" fill="#edc0c7" />
        </g>
      </svg>
    </div>

    <div class="garland garland-right">
      <svg viewBox="0 0 190 350">
        <path
          d="M32 2c20 62 8 112 30 156 18 36 9 82 26 126"
          fill="none"
          stroke="#b08b77"
          stroke-width="1.5"
          stroke-linecap="round"
          opacity=".72"
        />
        <path
          d="M48 57c18-9 35-4 44 10-18 9-34 4-44-10ZM55 103c-16-8-31-2-38 12 16 7 30 1 38-12ZM82 158c17-7 32 1 39 15-17 6-31-1-39-15ZM77 218c-14-9-29-5-37 8 14 9 28 5 37-8ZM104 276c14-4 27 4 31 18-14 3-26-5-31-18Z"
          fill="#a9b99e"
          opacity=".64"
        />
        <g transform="translate(48 88) rotate(-15)">
          <circle r="11" fill="#d49aa4" opacity=".62" />
          <path d="M0-18c9 6 9 17 0 24-9-7-9-18 0-24Z" fill="#edc0c7" />
          <path d="M-17-4c9-6 19-1 22 8-9 6-19 1-22-8Z" fill="#edc0c7" />
          <path d="M17-4c-9-6-19-1-22 8 9 6 19 1 22-8Z" fill="#edc0c7" />
          <circle r="5" fill="#9f6b74" opacity=".5" />
        </g>
        <g transform="translate(91 188) rotate(12)">
          <circle r="9" fill="#d49aa4" opacity=".6" />
          <path d="M0-15c7 5 7 14 0 20-7-6-7-15 0-20Z" fill="#edc0c7" />
          <path d="M-14-3c8-5 16-1 18 7-8 5-16 1-18-7Z" fill="#edc0c7" />
          <path d="M14-3c-8-5-16-1-18 7 8 5 16 1 18-7Z" fill="#edc0c7" />
          <circle r="4" fill="#9f6b74" opacity=".5" />
        </g>
        <g transform="translate(105 295) rotate(-8)">
          <circle r="8" fill="#d49aa4" opacity=".55" />
          <path d="M0-13c6 4 6 12 0 17-6-5-6-13 0-17Z" fill="#edc0c7" />
          <path d="M-12-2c7-4 14-1 16 6-7 4-14 1-16-6Z" fill="#edc0c7" />
          <path d="M12-2c-7-4-14-1-16 6 7 4 14 1 16-6Z" fill="#edc0c7" />
        </g>
      </svg>
    </div>

    <span
      v-for="butterfly in butterflies"
      :key="butterfly.id"
      class="butterfly"
      :style="{
        left: butterfly.left,
        top: butterfly.top,
        '--butterfly-scale': butterfly.scale,
        '--butterfly-x': butterfly.driftX,
        '--butterfly-y': butterfly.driftY,
        '--butterfly-duration': butterfly.duration,
        '--butterfly-delay': butterfly.delay,
        '--wing-a': butterfly.wingA,
        '--wing-b': butterfly.wingB,
      }"
    >
      <svg class="butterfly-art" viewBox="0 0 42 34" aria-hidden="true">
        <g class="wing-group wing-left-group">
          <path
            d="M21 15C15 5 6 1 3 5 0 10 3 15 10 18c4 2 9 1 11-3Z"
            fill="var(--wing-a)"
            stroke="rgba(255, 250, 242, 0.72)"
            stroke-width="0.8"
          />
          <path
            d="M21 17c-5 1-12 4-13 9-1 5 5 7 10 4 3-2 4-8 3-13Z"
            fill="var(--wing-b)"
            stroke="rgba(255, 250, 242, 0.68)"
            stroke-width="0.8"
          />
        </g>
        <g class="wing-group wing-right-group">
          <path
            d="M21 15C27 5 36 1 39 5c3 5 0 10-7 13-4 2-9 1-11-3Z"
            fill="var(--wing-a)"
            stroke="rgba(255, 250, 242, 0.72)"
            stroke-width="0.8"
          />
          <path
            d="M21 17c5 1 12 4 13 9 1 5-5 7-10 4-3-2-4-8-3-13Z"
            fill="var(--wing-b)"
            stroke="rgba(255, 250, 242, 0.68)"
            stroke-width="0.8"
          />
        </g>
        <ellipse cx="21" cy="17" rx="1.7" ry="7.2" fill="rgba(116, 82, 88, 0.7)" />
        <path
          d="M20 11c-2-3-4-4-6-4M22 11c2-3 4-4 6-4"
          fill="none"
          stroke="rgba(116, 82, 88, 0.58)"
          stroke-width="0.8"
          stroke-linecap="round"
        />
        <circle cx="13.5" cy="7" r="1" fill="rgba(255, 250, 242, 0.8)" />
        <circle cx="28.5" cy="7" r="1" fill="rgba(255, 250, 242, 0.8)" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
.flower-decor {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
}

.garland {
  position: absolute;
  top: -3%;
  width: clamp(105px, 14vw, 190px);
  height: min(37vh, 350px);
  opacity: 0.52;
  transform-origin: 50% 0;
  animation: garland-sway 11s ease-in-out infinite alternate;
}

.garland-left {
  left: -1.5%;
}

.garland-right {
  right: -1.5%;
  transform: scaleX(-1);
  animation-delay: -4.5s;
}

.garland svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 5px 9px rgba(121, 101, 97, 0.08));
}

.butterfly {
  position: absolute;
  width: 42px;
  height: 34px;
  opacity: 0.96;
  transform: scale(var(--butterfly-scale)) translate(-50%, -50%);
  animation: butterfly-float var(--butterfly-duration) ease-in-out
    var(--butterfly-delay) infinite alternate;
  filter: drop-shadow(0 3px 6px rgba(133, 110, 115, 0.14));
  will-change: transform;
}

.butterfly-art {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.wing-group {
  transform-box: fill-box;
}

.wing-left-group {
  transform-origin: right center;
  animation: butterfly-flap-left 0.72s ease-in-out infinite alternate;
}

.wing-right-group {
  transform-origin: left center;
  animation: butterfly-flap-right 0.72s ease-in-out -0.36s infinite alternate;
}

.flower-decor.is-night {
  opacity: 0.28;
}

.flower-decor.is-night .garland {
  opacity: 0.22;
}

.flower-decor.is-night .butterfly {
  opacity: 0.2;
}

@keyframes garland-sway {
  from {
    transform: rotate(-1.2deg);
  }
  to {
    transform: rotate(1.3deg);
  }
}

.garland-right {
  animation-name: garland-sway-right;
}

@keyframes garland-sway-right {
  from {
    transform: scaleX(-1) rotate(-1.2deg);
  }
  to {
    transform: scaleX(-1) rotate(1.3deg);
  }
}

@keyframes butterfly-float {
  from {
    transform: scale(var(--butterfly-scale)) translate(-50%, -50%) translate3d(0, 0, 0);
  }
  to {
    transform: scale(var(--butterfly-scale)) translate(-50%, -50%)
      translate3d(var(--butterfly-x), var(--butterfly-y), 0);
  }
}

@keyframes butterfly-flap-left {
  from {
    transform: rotate(-4deg) scaleX(1);
  }
  to {
    transform: rotate(16deg) scaleX(0.62);
  }
}

@keyframes butterfly-flap-right {
  from {
    transform: rotate(4deg) scaleX(1);
  }
  to {
    transform: rotate(-16deg) scaleX(0.62);
  }
}

@media (max-width: 760px) {
  .garland {
    width: 88px;
    height: 25vh;
    opacity: 0.32;
  }

  .butterfly {
    width: 32px;
    height: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .garland,
  .butterfly,
  .wing-left-group,
  .wing-right-group {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
  }
}
</style>
