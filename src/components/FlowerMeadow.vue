<script setup>
const flowerPalette = [
  { petal: '#f6eae0', center: '#d6b67f', leaf: '#a5b6a0' },
  { petal: '#f0d4dc', center: '#d9bb85', leaf: '#99ad95' },
  { petal: '#e9ddec', center: '#d3b98a', leaf: '#a9baa1' },
  { petal: '#f7efe3', center: '#cfaf79', leaf: '#93a98f' },
  { petal: '#eed9d6', center: '#dcc08b', leaf: '#9eb29b' },
]

const flowerPositions = [
  { x: 88, y: 650, scale: 0.72, kind: 0, back: true, lean: -5, tilt: -9 },
  { x: 218, y: 604, scale: 0.54, kind: 2, back: true, lean: 7, tilt: 8 },
  { x: 352, y: 660, scale: 0.68, kind: 1, back: true, lean: -6, tilt: -5 },
  { x: 506, y: 584, scale: 0.46, kind: 0, back: true, lean: 4, tilt: 7 },
  { x: 652, y: 646, scale: 0.58, kind: 3, back: true, lean: -4, tilt: 3 },
  { x: 811, y: 596, scale: 0.5, kind: 2, back: true, lean: 8, tilt: -7 },
  { x: 957, y: 654, scale: 0.67, kind: 1, back: true, lean: -7, tilt: 6 },
  { x: 1112, y: 608, scale: 0.52, kind: 0, back: true, lean: 5, tilt: -9 },
  { x: 1272, y: 666, scale: 0.73, kind: 3, back: true, lean: -8, tilt: 4 },
  { x: 1392, y: 620, scale: 0.52, kind: 2, back: true, lean: 2, tilt: -3 },
  { x: 116, y: 694, scale: 0.72, kind: 4, back: false, mid: true, lean: 5, tilt: 6 },
  { x: 396, y: 664, scale: 0.62, kind: 2, back: false, mid: true, lean: -7, tilt: -4 },
  { x: 676, y: 688, scale: 0.78, kind: 1, back: false, mid: true, lean: 8, tilt: 8 },
  { x: 996, y: 662, scale: 0.64, kind: 3, back: false, mid: true, lean: -6, tilt: -7 },
  { x: 1296, y: 700, scale: 0.75, kind: 0, back: false, mid: true, lean: 4, tilt: 4 },
  { x: 816, y: 634, scale: 0.54, kind: 4, back: false, mid: true, lean: -3, tilt: -5 },
  { x: 48, y: 802, scale: 1.02, kind: 1, back: false, lean: -9, tilt: 9 },
  { x: 166, y: 774, scale: 0.95, kind: 0, back: false, lean: 11, tilt: -7 },
  { x: 306, y: 835, scale: 1.18, kind: 3, back: false, lean: -11, tilt: 4 },
  { x: 432, y: 760, scale: 0.88, kind: 2, back: false, lean: 8, tilt: -10 },
  { x: 556, y: 812, scale: 1.04, kind: 4, back: false, lean: -10, tilt: 6 },
  { x: 685, y: 754, scale: 0.83, kind: 0, back: false, lean: 6, tilt: -5 },
  { x: 802, y: 832, scale: 1.14, kind: 1, back: false, lean: 9, tilt: 8 },
  { x: 932, y: 766, scale: 0.9, kind: 3, back: false, lean: -7, tilt: -4 },
  { x: 1064, y: 824, scale: 1.1, kind: 0, back: false, lean: 11, tilt: -8 },
  { x: 1190, y: 750, scale: 0.84, kind: 2, back: false, lean: -5, tilt: 5 },
  { x: 1322, y: 807, scale: 1.06, kind: 1, back: false, lean: 7, tilt: -7 },
  { x: 1436, y: 862, scale: 1.2, kind: 4, back: false, lean: -4, tilt: 8 },
  { x: 756, y: 892, scale: 1.35, kind: 2, back: false, lean: 12, tilt: -3 },
  { x: 374, y: 885, scale: 1.28, kind: 0, back: false, lean: 10, tilt: 7 },
]

const flowers = flowerPositions.map((flower, index) => {
  const palette = flowerPalette[(index + flower.kind) % flowerPalette.length]
  const petalCount = flower.kind === 1 ? 8 : flower.kind === 3 ? 6 : 7
  return {
    ...flower,
    ...palette,
    petalCount,
    petalAngles: Array.from(
      { length: petalCount },
      (_, petalIndex) => (360 / petalCount) * petalIndex + (index % 2 ? 14 : 0),
    ),
    delay: `${-((index * 0.73) % 8).toFixed(2)}s`,
    duration: `${(7 + (index % 5) * 0.8).toFixed(2)}s`,
    stemPath: `M ${flower.x} 915 Q ${flower.x + flower.lean * 0.5} ${(flower.y + 915) / 2} ${flower.x + flower.lean} ${flower.y + 31}`,
    leafLeft: {
      x: flower.x + flower.lean * 0.3 - 11,
      y: (flower.y + 915) / 2 + 16,
    },
    leafRight: {
      x: flower.x + flower.lean * 0.3 + 8,
      y: (flower.y + 915) / 2 + 54,
    },
  }
})

const dandelions = [
  { x: 258, y: 520, scale: 0.92, lean: -12, delay: '-1.5s' },
  { x: 1178, y: 486, scale: 0.72, lean: 15, delay: '-4.2s' },
  { x: 722, y: 548, scale: 0.5, lean: 8, delay: '-2.7s' },
].map((dandelion) => ({
  ...dandelion,
  stemPath: `M ${dandelion.x} 910 Q ${dandelion.x + dandelion.lean * 1.8} ${dandelion.y + 180} ${dandelion.x + dandelion.lean} ${dandelion.y + 38}`,
  seeds: Array.from({ length: 26 }, (_, index) => {
    const angle = (360 / 26) * index + (dandelion.x % 5)
    const rad = (angle * Math.PI) / 180
    const radius = 44 - (index % 3) * 4
    return {
      x2: Math.cos(rad) * radius,
      y2: Math.sin(rad) * radius,
      length: 0.72 + (index % 4) * 0.08,
    }
  }),
}))

const grassBlades = Array.from({ length: 46 }, (_, index) => {
  const x = 18 + index * 31 + ((index * 47) % 23)
  return {
    d: `M ${x} 916 Q ${x + (index % 2 ? 18 : -14)} ${840 - (index % 7) * 11} ${x + (index % 2 ? 35 : -27)} ${800 - (index % 5) * 17}`,
    opacity: 0.12 + (index % 5) * 0.026,
    width: 0.7 + (index % 3) * 0.35,
  }
})

const miniFlowers = Array.from({ length: 56 }, (_, index) => ({
  x: 24 + ((index * 113) % 1392),
  y: 654 + ((index * 47) % 228),
  r: 1.4 + (index % 4) * 0.65,
  opacity: 0.18 + (index % 5) * 0.06,
}))
</script>

<template>
  <div class="meadow" aria-hidden="true">
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      class="meadow-svg"
      role="presentation"
    >
      <defs>
        <linearGradient id="meadow-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d8dfca" stop-opacity="0" />
          <stop offset="28%" stop-color="#c4d1bd" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#99ad98" stop-opacity="0.86" />
        </linearGradient>
        <linearGradient id="meadow-grass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#8ca28b" />
          <stop offset="100%" stop-color="#b9c9b2" />
        </linearGradient>
        <radialGradient id="meadow-haze" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#fff8ec" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ebddda" stop-opacity="0" />
        </radialGradient>
        <filter id="soft-big" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <filter id="soft-small" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id="dream-blur" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      <ellipse cx="720" cy="540" rx="800" ry="360" fill="url(#meadow-haze)" />

      <g opacity="0.52">
        <ellipse cx="210" cy="560" rx="310" ry="105" fill="#e7d5d3" filter="url(#soft-big)" />
        <ellipse cx="1215" cy="530" rx="330" ry="120" fill="#d7d8e8" filter="url(#soft-big)" />
        <ellipse cx="760" cy="620" rx="380" ry="130" fill="#f3e7d8" filter="url(#soft-big)" />
      </g>

      <path
        d="M0 622 C 180 592 280 625 440 614 C 610 602 674 575 828 596 C 1010 620 1110 582 1280 606 C 1360 617 1412 612 1440 604 L 1440 900 L 0 900 Z"
        fill="url(#meadow-ground)"
      />
      <path
        d="M0 692 C 138 658 286 702 432 680 C 586 657 740 690 900 675 C 1072 659 1226 698 1440 662 L 1440 900 L 0 900 Z"
        fill="#c0cdb8"
        opacity="0.36"
      />
      <path
        d="M0 774 C 206 740 318 783 526 760 C 760 734 906 781 1114 752 C 1252 733 1350 754 1440 744 L 1440 900 L 0 900 Z"
        fill="#aebea8"
        opacity="0.32"
      />

      <g opacity="0.34" filter="url(#soft-small)">
        <circle cx="398" cy="604" r="2.1" fill="#f8efe0" />
        <circle cx="613" cy="576" r="1.6" fill="#f8efe0" />
        <circle cx="912" cy="602" r="2.2" fill="#f8efe0" />
        <circle cx="1088" cy="568" r="1.5" fill="#f8efe0" />
        <circle cx="1262" cy="610" r="2" fill="#f8efe0" />
      </g>

      <g class="grass-layer">
        <path
          v-for="(blade, index) in grassBlades"
          :key="`grass-${index}`"
          :d="blade.d"
          fill="none"
          stroke="url(#meadow-grass)"
          :stroke-width="blade.width"
          :opacity="blade.opacity"
          stroke-linecap="round"
        />
      </g>

      <g class="mini-flower-layer">
        <g
          v-for="(mini, index) in miniFlowers"
          :key="`mini-${index}`"
          :opacity="mini.opacity"
        >
          <circle
            v-for="petal in 5"
            :key="petal"
            :cx="mini.x + Math.cos((petal / 5) * Math.PI * 2) * mini.r"
            :cy="mini.y + Math.sin((petal / 5) * Math.PI * 2) * mini.r"
            :r="mini.r * 0.7"
            fill="#f6eee4"
          />
          <circle :cx="mini.x" :cy="mini.y" :r="mini.r * 0.35" fill="#d8bc87" />
        </g>
      </g>

      <g class="dandelion-layer">
        <g
          v-for="(dandelion, index) in dandelions"
          :key="`dandelion-${index}`"
          class="dandelion"
          :style="{ '--dandelion-delay': dandelion.delay }"
        >
          <path
            :d="dandelion.stemPath"
            fill="none"
            stroke="#9caf98"
            stroke-width="2.1"
            stroke-linecap="round"
            opacity="0.48"
          />
          <g :transform="`translate(${dandelion.x + dandelion.lean} ${dandelion.y}) scale(${dandelion.scale})`">
            <g class="dandelion-head">
              <circle r="33" fill="#fffaf0" opacity="0.18" filter="url(#soft-small)" />
              <circle r="12" fill="#f7ecd8" opacity="0.74" />
              <g
                v-for="(seed, seedIndex) in dandelion.seeds"
                :key="`seed-${seedIndex}`"
                stroke="#fffaf1"
                stroke-width="0.7"
                stroke-linecap="round"
                opacity="0.76"
              >
                <line
                  :x2="seed.x2"
                  :y2="seed.y2"
                  :transform="`scale(${seed.length})`"
                />
                <circle
                  :cx="seed.x2 * seed.length"
                  :cy="seed.y2 * seed.length"
                  r="1.2"
                  fill="#fffdf5"
                  stroke="none"
                />
              </g>
            </g>
          </g>
        </g>
      </g>

      <g class="flower-layer">
        <g
          v-for="(flower, index) in flowers"
          :key="`flower-${index}`"
          class="flower"
          :class="{ 'is-back': flower.back, 'is-mid': flower.mid }"
          :style="{ '--flower-delay': flower.delay, '--flower-duration': flower.duration }"
        >
          <path
            :d="flower.stemPath"
            fill="none"
            :stroke="flower.leaf"
            :stroke-width="flower.scale * (flower.back ? 1.1 : 2.2)"
            stroke-linecap="round"
            :opacity="flower.back ? 0.28 : 0.52"
          />
          <ellipse
            :cx="flower.leafLeft.x"
            :cy="flower.leafLeft.y"
            :rx="4.3 * flower.scale"
            :ry="12 * flower.scale"
            :fill="flower.leaf"
            opacity="0.34"
            :transform="`rotate(-38 ${flower.leafLeft.x} ${flower.leafLeft.y})`"
          />
          <ellipse
            :cx="flower.leafRight.x"
            :cy="flower.leafRight.y"
            :rx="3.5 * flower.scale"
            :ry="10 * flower.scale"
            :fill="flower.leaf"
            opacity="0.28"
            :transform="`rotate(34 ${flower.leafRight.x} ${flower.leafRight.y})`"
          />

          <g :transform="`translate(${flower.x + flower.lean} ${flower.y}) scale(${flower.scale})`">
            <g
              class="flower-head"
              :style="{ '--flower-delay': flower.delay, '--flower-duration': flower.duration }"
              :filter="flower.back ? 'url(#dream-blur)' : undefined"
            >
              <ellipse
                v-for="angle in flower.petalAngles"
                :key="angle"
                cx="0"
                cy="-20"
                rx="10.5"
                ry="19"
                :fill="flower.petal"
                :opacity="flower.back ? 0.5 : 0.76"
                :transform="`rotate(${angle + flower.tilt})`"
              />
              <circle r="9.5" :fill="flower.center" opacity="0.84" />
              <circle cx="-2.6" cy="-2.6" r="2.7" fill="#fff8e9" opacity="0.6" />
            </g>
          </g>
        </g>
      </g>

      <g opacity="0.3">
        <ellipse cx="190" cy="876" rx="240" ry="55" fill="#849a86" filter="url(#soft-big)" />
        <ellipse cx="1240" cy="882" rx="290" ry="70" fill="#819683" filter="url(#soft-big)" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.meadow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.meadow-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.97;
  filter: saturate(1.18) contrast(1.03);
}

.flower-head,
.dandelion-head {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: meadow-sway var(--flower-duration, 7s) ease-in-out infinite alternate;
  animation-delay: var(--flower-delay, 0s);
  will-change: transform;
}

.dandelion-head {
  --flower-duration: 9s;
  animation-delay: var(--dandelion-delay, 0s);
}

.flower.is-back {
  opacity: 0.62;
}

.flower.is-mid {
  opacity: 0.78;
}

.grass-layer,
.mini-flower-layer,
.dandelion-layer,
.flower-layer {
  pointer-events: none;
}

@keyframes meadow-sway {
  0% {
    transform: rotate(-0.7deg) translateY(0);
  }
  100% {
    transform: rotate(1.1deg) translateY(-2.5px);
  }
}

@media (max-width: 700px) {
  .meadow-svg {
    opacity: 0.9;
  }
}
</style>
