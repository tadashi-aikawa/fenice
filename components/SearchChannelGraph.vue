<script setup lang="ts">
import { Message } from "@/clients/slack/models";
import { count } from "@/utils/collections";
import apexchart from "vue3-apexcharts";

const props = defineProps<{
  messages: Message[];
}>();

const latestDisplayDate = computed(() =>
  ts2display(
    maxBy(
      props.messages.map((m) => m.ts),
      Number,
    ),
    { onlyDate: true },
  ),
);
const oldestDisplayDate = computed(() =>
  ts2display(
    minBy(
      props.messages.map((m) => m.ts),
      Number,
    ),
    { onlyDate: true },
  ),
);

const countByChannelName = computed(() =>
  count(props.messages.map((x) => x.channel.name)),
);
const graphHeight = computed(
  () => (Object.keys(countByChannelName.value).length + 1) * 50 || 0,
);
const series = computed(() => [
  {
    data: Object.values(countByChannelName.value).sort(
      sorter((x) => x, "desc"),
    ),
  },
]);
const options = computed(() => ({
  title: {
    text:
      props.messages.length > 0
        ? `${oldestDisplayDate.value} ~ ${latestDisplayDate.value} の投稿 ${props.messages.length} 件`
        : "",
  },
  chart: {
    width: 480,
    height: Math.min(graphHeight.value, 900),
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
    categories: Object.entries(countByChannelName.value)
      .sort(sorter(([_, count]) => count, "desc"))
      .map(([n, _]) => n),
  },
  tooltip: { enabled: false },
}));
</script>

<template>
  <apexchart type="bar" :options="options" :series="series"></apexchart>
</template>
