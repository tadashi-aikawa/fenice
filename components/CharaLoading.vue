<script setup lang="ts">
interface Props {
  size?: "small" | "medium";
}
const props = withDefaults(defineProps<Props>(), {
  size: "medium",
});

const width = computed(() => {
  switch (props.size) {
    case "small":
      return "85px";
    case "medium":
      return "125px";
    default:
      throw new ExhaustiveError(props.size);
  }
});

const fontSize = computed(() => {
  switch (props.size) {
    case "small":
      return "2rem";
    case "medium":
      return "4rem";
    default:
      throw new ExhaustiveError(props.size);
  }
});
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <div class="chara">
      <img src="/icon/384.png" :width="width" />
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
</template>

<style scoped>
.chara img {
  animation: hop 2s infinite ease-in-out;
}

.loading {
  font-size: v-bind(fontSize);
  display: flex;
  justify-content: center;
  gap: 5px;
  color: darkturquoise;
  text-shadow:
    2px 2px 0 #ccc,
    -2px -2px 0 #ccc,
    -2px 2px 0 #ccc,
    2px -2px 0 #ccc,
    0px 2px 0 #ccc,
    0-2px 0 #ccc,
    -2px 0 0 #ccc,
    2px 0 0 #ccc;
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
