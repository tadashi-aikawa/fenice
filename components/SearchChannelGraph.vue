<script setup lang="ts">
import { Message } from "@/clients/slack/models";
import { clearFirstSelection, select } from "@/utils/apexcharts";
import { count } from "@/utils/collections";
import type { VueApexChartsComponent } from "vue3-apexcharts";
import apexchart from "vue3-apexcharts";

const props = defineProps<{
  messages: Message[];
}>();

function clearSelection() {
  if (chart.value) {
    clearFirstSelection(chart.value);
  }
}
function selectByName(channelName: string) {
  if (!chart.value) {
    return;
  }

  const i = channelNames.value.findIndex((x) => x === channelName);
  if (i === -1) {
    return;
  }

  select(chart.value, i);
}
defineExpose({ clearSelection, selectByName });

const emit = defineEmits<{
  "change:selection": [channel: string | null];
}>();

const countByChannelName = computed(() =>
  count(props.messages.map((x) => x.channel.name)),
);
const graphHeight = computed(
  () => (Object.keys(countByChannelName.value).length + 2) * 45 || 0,
);
const series = computed(() => [
  {
    data: Object.values(countByChannelName.value).sort(
      sorter((x) => x, "desc"),
    ),
  },
]);
const channelNames = computed(() =>
  Object.entries(countByChannelName.value)
    .sort(sorter(([_, count]) => count, "desc"))
    .map(([n, _]) => n),
);
const options = computed<VueApexChartsComponent["options"]>(() => ({
  title: {
    text: "投稿channel内訳",
  },
  chart: {
    width: 400,
    height: Math.min(graphHeight.value, 650),
    events: {
      dataPointSelection(_, _2, options) {
        const index = options.w.globals.selectedDataPoints[0];
        emit("change:selection", index ? channelNames.value[index] : null);
      },
    },
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
      maxWidth: 260,
    },
  },
  xaxis: {
    categories: channelNames.value,
  },
  tooltip: { enabled: false },
}));

const chart = ref<VueApexChartsComponent | null>(null);
</script>

<template>
  <apexchart
    ref="chart"
    type="bar"
    :options="options"
    :series="series"
  ></apexchart>
</template>
