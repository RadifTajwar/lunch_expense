<template>
  <LineChart
    :chart-data="chartData"
    :chart-options="chartOptions"
    style="height: 300px"
  />
</template>

<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { defineProps, computed } from "vue";
import { Line as LineChart } from "vue-chart-3";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const props = defineProps({
  data: { type: Array, default: () => [] },
});

const chartData = computed(() => ({
  labels: props.data.map((d) => d.month),
  datasets: [
    {
      label: "Meal Rate (tk/meal)",
      data: props.data.map((d) => d.mealRate),
      borderColor: "rgb(75, 192, 192)",
      tension: 0.3,
      fill: false,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>
