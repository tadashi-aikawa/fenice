<script setup lang="ts">
import { Message } from "@/clients/slack/models";
import { DateTime } from "owlelia";
import { computed } from "vue";
import apexchart, { VueApexChartsComponent } from "vue3-apexcharts";

const props = defineProps<{
  messages: Message[];
}>();

const messageNumByDate = computed(() =>
  countBy(props.messages, (m) => DateTime.of(Number(m.ts)).displayDate),
);

const series = computed(() => {
  const data = dates.value.map(
    (d) => messageNumByDate.value[d.displayDate] ?? 0,
  );
  return [{ data }];
});

const dates = computed<DateTime[]>(() => {
  if (props.messages.length === 0) {
    return [];
  }
  const today = DateTime.today();
  return today.minusDays(30).toDate(today);
});

const options = computed<VueApexChartsComponent["options"]>(() => ({
  title: { text: "直近30日の投稿分布(フィルタ後)" },
  chart: {
    type: "bar",
    width: 800,
    height: 200,
    animations: { enabled: false },
  },
  yaxis: {
    min: 0,
  },
  xaxis: {
    categories: dates.value.map((d) => d.format("M月D日")),
  },
  colors: ["#AB2564"],
  tooltip: { enabled: false },
}));
</script>

<template>
  <apexchart :options="options" :series="series"></apexchart>
</template>
