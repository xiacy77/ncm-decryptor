<template>
  <div class="celestial-decor" aria-hidden="true">
    <span class="milky-way"></span>
    <span class="nebula nebula-a"></span>
    <span class="nebula nebula-b"></span>
    <span class="nebula nebula-c"></span>

    <span class="celestial-orbit orbit-a"></span>
    <span class="celestial-orbit orbit-b"></span>

    <svg class="constellation constellation-a" viewBox="0 0 220 180">
      <path d="M18 144 57 91 101 109 142 52 190 77" />
      <g>
        <circle cx="18" cy="144" r="2.2" />
        <circle cx="57" cy="91" r="2.6" />
        <circle cx="101" cy="109" r="1.8" />
        <circle cx="142" cy="52" r="2.6" />
        <circle cx="190" cy="77" r="2" />
      </g>
    </svg>

    <svg class="constellation constellation-b" viewBox="0 0 180 180">
      <path d="M28 35 69 58 92 113 141 129 156 86" />
      <g>
        <circle cx="28" cy="35" r="2" />
        <circle cx="69" cy="58" r="2.6" />
        <circle cx="92" cy="113" r="1.8" />
        <circle cx="141" cy="129" r="2.4" />
        <circle cx="156" cy="86" r="1.8" />
      </g>
    </svg>

    <span class="shooting-star shooting-a"></span>
    <span class="shooting-star shooting-b"></span>
    <span class="shooting-star shooting-c"></span>
  </div>
</template>

<style scoped>
.celestial-decor {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.milky-way {
  position: absolute;
  left: -20%;
  top: 31%;
  width: 145%;
  height: 20vh;
  opacity: 0.26;
  transform: rotate(-24deg);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(183, 173, 220, 0.08) 24%,
    rgba(231, 211, 206, 0.14) 48%,
    rgba(155, 177, 218, 0.08) 72%,
    transparent
  );
  filter: blur(28px);
  animation: milky-breathe 22s ease-in-out infinite alternate;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(55px);
  opacity: 0.5;
  mix-blend-mode: screen;
  animation: nebula-breathe 20s ease-in-out infinite alternate;
}

.nebula-a {
  left: -12%;
  top: 4%;
  width: 52vw;
  height: 38vh;
  background: radial-gradient(
    ellipse,
    rgba(132, 120, 177, 0.15),
    rgba(109, 102, 151, 0.04) 50%,
    transparent 74%
  );
}

.nebula-b {
  right: -8%;
  top: 31%;
  width: 46vw;
  height: 42vh;
  background: radial-gradient(
    ellipse,
    rgba(189, 140, 158, 0.12),
    rgba(145, 132, 181, 0.04) 48%,
    transparent 76%
  );
  animation-delay: -7s;
}

.nebula-c {
  left: 22%;
  bottom: -14%;
  width: 58vw;
  height: 36vh;
  background: radial-gradient(
    ellipse,
    rgba(106, 139, 181, 0.1),
    rgba(111, 113, 160, 0.03) 54%,
    transparent 78%
  );
  animation-delay: -13s;
}

.celestial-orbit {
  position: absolute;
  left: 50%;
  top: 46%;
  border: 1px solid rgba(238, 219, 189, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(-18deg);
  opacity: 0.72;
}

.orbit-a {
  width: 96vw;
  height: 48vh;
}

.orbit-b {
  width: 74vw;
  height: 66vh;
  border-color: rgba(196, 190, 226, 0.08);
  transform: translate(-50%, -50%) rotate(27deg);
}

.constellation {
  position: absolute;
  overflow: visible;
  opacity: 0.52;
}

.constellation path {
  fill: none;
  stroke: rgba(228, 220, 237, 0.32);
  stroke-width: 0.8;
  stroke-dasharray: 2 5;
}

.constellation circle {
  fill: rgba(250, 241, 224, 0.8);
  filter: drop-shadow(0 0 5px rgba(245, 226, 193, 0.45));
  animation: constellation-twinkle 6s ease-in-out infinite alternate;
}

.constellation circle:nth-child(2n) {
  animation-delay: -2.4s;
}

.constellation-a {
  left: 5%;
  top: 18%;
  width: clamp(110px, 15vw, 220px);
}

.constellation-b {
  right: 6%;
  top: 17%;
  width: clamp(90px, 12vw, 180px);
  opacity: 0.32;
  transform: rotate(8deg);
}

.shooting-star {
  position: absolute;
  width: 120px;
  height: 1px;
  opacity: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 246, 221, 0.86), transparent);
  filter: drop-shadow(0 0 5px rgba(255, 238, 202, 0.5));
  transform: rotate(-31deg);
  animation: shooting 15s ease-in-out infinite;
}

.shooting-a {
  left: 18%;
  top: 24%;
  animation-delay: 3s;
}

.shooting-b {
  right: 11%;
  top: 44%;
  width: 90px;
  animation-delay: 9s;
}

.shooting-c {
  left: 48%;
  top: 12%;
  width: 70px;
  opacity: 0;
  animation-delay: 13s;
}

@keyframes milky-breathe {
  from {
    opacity: 0.18;
    transform: rotate(-24deg) translate3d(-1%, 1%, 0);
  }
  to {
    opacity: 0.34;
    transform: rotate(-24deg) translate3d(1%, -1%, 0);
  }
}

@keyframes nebula-breathe {
  from {
    opacity: 0.32;
    transform: scale(0.94) translate3d(-1%, 1%, 0);
  }
  to {
    opacity: 0.62;
    transform: scale(1.04) translate3d(1%, -1%, 0);
  }
}

@keyframes constellation-twinkle {
  from {
    opacity: 0.36;
  }
  to {
    opacity: 0.95;
  }
}

@keyframes shooting {
  0%,
  72%,
  100% {
    opacity: 0;
    translate: 0 0;
  }
  74% {
    opacity: 0.8;
  }
  82% {
    opacity: 0;
    translate: 140px 84px;
  }
}

@media (max-width: 760px) {
  .constellation {
    opacity: 0.22;
  }

  .constellation-a {
    left: -2%;
    top: 15%;
    width: 130px;
  }

  .constellation-b {
    right: -3%;
    top: 18%;
    bottom: auto;
    width: 110px;
  }

  .celestial-orbit {
    opacity: 0.42;
  }

  .orbit-a {
    width: 130vw;
    height: 38vh;
  }

  .orbit-b {
    width: 100vw;
    height: 52vh;
  }

  .shooting-star {
    width: 70px;
  }

  .nebula {
    filter: blur(40px);
  }
}
</style>
