<script setup lang="ts"></script>

<template>
  <div style="display: flex; justify-content: center; width: 95vw">
    <div style="display: flex; align-items: center; gap: 16px">
      <div class="chara">
        <img src="/icon/384.png" width="125px" />
      </div>
      <p class="loading">
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.chara img {
  animation: hop 2s infinite ease-in-out;
}

.loading {
  font-size: 4rem;
  display: flex;
  justify-content: center;
  gap: 5px;
  color: darkturquoise;
  text-shadow:
    1px 1px 0 #ccc,
    -1px -1px 0 #ccc,
    -1px 1px 0 #ccc,
    1px -1px 0 #ccc,
    0px 1px 0 #ccc,
    0-1px 0 #ccc,
    -1px 0 0 #ccc,
    1px 0 0 #ccc;
}

.loading span {
  display: inline-block;
  font-weight: bold;
  animation: rotate 2s infinite linear;
}

.loading span:nth-child(2) {
  animation-delay: 0.1s;
}

.loading span:nth-child(3) {
  animation-delay: 0.2s;
}

.loading span:nth-child(4) {
  animation-delay: 0.3s;
}

.loading span:nth-child(5) {
  animation-delay: 0.4s;
}

.loading span:nth-child(6) {
  animation-delay: 0.5s;
}

.loading span:nth-child(7) {
  animation-delay: 0.6s;
}

.loading span:nth-child(8) {
  animation-delay: 0.7s;
}

.loading span:nth-child(9) {
  animation-delay: 0.8s;
}

.loading span:nth-child(10) {
  animation-delay: 0.9s;
}

@keyframes rotate {
  0% {
    transform: rotateX(360deg);
  }

  30% {
    transform: rotateX(0deg);
  }
}

@keyframes hop {
  0% {
    margin-top: 0;
  }
  20% {
    margin-top: -50px;
  }
  40% {
    margin-top: 0;
  }
  52% {
    margin-top: -25px;
  }
  64% {
    margin-top: 0;
  }
  72% {
    margin-top: -10px;
  }
  85% {
    margin-top: 0;
  }
}
</style>
