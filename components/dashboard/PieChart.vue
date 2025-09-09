<template>
  <div>
    <PieChart :chart-data="chartData" :options="options" />
  </div>
</template>

<script setup>
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { PieChart } from "vue-chart-3";
import { computed } from "vue";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  data: { type: Array, required: true },
});

const chartData = computed(() => ({
  labels: props.data.map((r) => r.name),
  datasets: [
    {
      label: "Expenses",
      backgroundColor: ["#f87171", "#60a5fa", "#34d399", "#fbbf24"],
      data: props.data.map((r) => r.totalExpense),
    },
  ],
}));

const options = {
  responsive: true,
  plugins: {
    legend: { position: "bottom" },
    title: { display: true, text: "Expense Distribution" },
  },
};
</script>
