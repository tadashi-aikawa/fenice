import type { VueApexChartsComponent } from "vue3-apexcharts";

export function clearFirstSelection(chart: VueApexChartsComponent) {
  const selectedIndex = (chart.chart as any).w.globals.selectedDataPoints[0];
  chart.toggleDataPointSelection(0, selectedIndex);
}
