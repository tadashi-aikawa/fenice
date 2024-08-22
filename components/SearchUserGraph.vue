<script setup lang="ts">
import { Message } from "@/clients/slack/models";
import { count } from "@/utils/collections";
import apexchart from "vue3-apexcharts";

const props = defineProps<{
  messages: Message[];
}>();

const countByUserName = computed(() =>
  count(props.messages.map((x) => x.username)),
);
const graphHeight = computed(
  () => (Object.keys(countByUserName.value).length + 1) * 50 || 0,
);
const series = computed(() => [
  {
    data: Object.values(countByUserName.value).sort(sorter((x) => x, "desc")),
  },
]);
const options = computed(() => ({
  title: {
    text: "投稿ユーザー内訳",
  },
  chart: {
    width: 400,
    height: Math.min(graphHeight.value, 850),
  },
  plotOptions: {
    bar: {
      horizontal: true,
    },
  },
  yaxis: {
    opposite: true,
    reversed: true,
    tooltip: {
      enabled: false,
    },
    labels: {
      maxWidth: 300,
    },
  },
  xaxis: {
    categories: Object.entries(countByUserName.value)
      .sort(sorter(([_, count]) => count, "desc"))
      .map(([n, _]) => n),
  },
  tooltip: { enabled: false },
}));
</script>

<template>
  <apexchart type="bar" :options="options" :series="series"></apexchart>
</template>
