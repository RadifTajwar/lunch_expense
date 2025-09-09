<template>
  <div>
    <BarChart :chart-data="chartData" :options="options" />
  </div>
</template>

<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { BarChart } from "vue-chart-3";
import { computed } from "vue";

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps({
  data: { type: Array, required: true },
});

const chartData = computed(() => ({
  labels: props.data.map((r) => r.name),
  datasets: [
    {
      label: "Advance",
      backgroundColor: "#4ade80",
      data: props.data.map((r) => r.totalAdvance),
    },
    {
      label: "Expense",
      backgroundColor: "#f87171",
      data: props.data.map((r) => r.totalExpense),
    },
  ],
}));

const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Advance vs Expense" },
  },
};
</script>
