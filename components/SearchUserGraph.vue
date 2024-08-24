<script setup lang="ts">
import { Message } from "@/clients/slack/models";
import { clearFirstSelection } from "@/utils/apexcharts";
import { count } from "@/utils/collections";
import apexchart, { VueApexChartsComponent } from "vue3-apexcharts";

const props = defineProps<{
  messages: Message[];
}>();
watch(
  () => props.messages,
  (_ms) => {
    if (chart.value) {
      clearFirstSelection(chart.value);
    }
  },
);

const emit = defineEmits<{
  "change:selection": [userName: string | null];
}>();

const countByUserName = computed(() =>
  count(props.messages.map((x) => x.username)),
);
const graphHeight = computed(
  () => (Object.keys(countByUserName.value).length + 1) * 45 || 0,
);
const series = computed(() => [
  {
    data: Object.values(countByUserName.value).sort(sorter((x) => x, "desc")),
  },
]);
const userNames = computed(() =>
  Object.entries(countByUserName.value)
    .sort(sorter(([_, count]) => count, "desc"))
    .map(([n, _]) => n),
);
const options = computed<VueApexChartsComponent["options"]>(() => ({
  title: {
    text: "投稿ユーザー内訳",
  },
  chart: {
    width: 400,
    height: Math.min(graphHeight.value, 850),
    events: {
      dataPointSelection(_, _2, options) {
        const index = options.w.globals.selectedDataPoints[0];
        emit("change:selection", index ? userNames.value[index] : null);
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
      maxWidth: 300,
    },
  },
  xaxis: {
    categories: userNames.value,
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
