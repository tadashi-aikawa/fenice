import type { VueApexChartsComponent } from "vue3-apexcharts";

export function clearFirstSelection(chart: VueApexChartsComponent) {
  const selectedIndex = getSelectedIndex(chart);
  if (selectedIndex === undefined) {
    return;
  }

  chart.toggleDataPointSelection(0, selectedIndex);
}

export function getSelectedIndex(
  chart: VueApexChartsComponent,
): number | undefined {
  return (chart.chart as any).w.globals.selectedDataPoints[0]?.[0];
}

export function select(chart: VueApexChartsComponent, index: number) {
  const si = getSelectedIndex(chart);
  if (si !== undefined) {
    clearFirstSelection(chart);
  }

  chart.toggleDataPointSelection(0, index);
}
