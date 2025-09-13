<template>
  <div class="pt-20 px-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold">📊 Dashboard</h2>

      <div class="flex flex-wrap gap-3">
        <!-- Month Picker -->
        <Calendar
          v-model="selectedMonth"
          view="month"
          dateFormat="yy-mm"
          placeholder="Selec572t Month"
          class="w-40"
          @update:modelValue="fetchDashboard"
        />

        <!-- Export Buttons -->
        <Button
          label="CSV"
          icon="pi pi-file"
          severity="secondary"
          @click="exportCSV"
        />
        <Button
          label="PDF"
          icon="pi pi-file-pdf"
          severity="danger"
          @click="exportPDF"
        />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <!-- Advance Paid -->
      <Card class="shadow-md rounded-2xl">
        <template #content>
          <div class="text-center">
            <h3 class="text-lg font-medium">💰 Advance Paid</h3>
            <p class="text-2xl font-bold text-green-600">
              {{ summary.totalAdvance.toFixed(2) }} tk
            </p>
          </div>
        </template>
      </Card>

      <!-- Meal Expenses -->
      <Card class="shadow-md rounded-2xl">
        <template #content>
          <div class="text-center">
            <h3 class="text-lg font-medium">🍽️ Meal Expenses</h3>
            <p class="text-2xl font-bold text-red-600">
              {{ summary.totalExpense.toFixed(2) }} tk
            </p>
          </div>
        </template>
      </Card>

      <!-- Final Balance -->
      <Card class="shadow-md rounded-2xl">
        <template #content>
          <div class="text-center">
            <h3 class="text-lg font-medium">⚖️ Final Balance</h3>
            <p
              class="text-2xl font-bold"
              :class="summary.balance >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ summary.balance.toFixed(2) }} tk
            </p>
          </div>
        </template>
      </Card>

      <!-- Total Meals -->
      <Card class="shadow-md rounded-2xl">
        <template #content>
          <div class="text-center">
            <h3 class="text-lg font-medium">🍛 Total Meals</h3>
            <p class="text-2xl font-bold text-purple-600">
              {{ totalMeals }} meals
            </p>
          </div>
        </template>
      </Card>

      <!-- Meal Rate -->
      <Card class="shadow-md rounded-2xl">
        <template #content>
          <div class="text-center">
            <h3 class="text-lg font-medium">📈 Meal Rate</h3>
            <p class="text-2xl font-bold text-blue-600">
              {{ mealRate.toFixed(2) }} tk/meal
            </p>
          </div>
        </template>
      </Card>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card class="shadow-md rounded-2xl lg:col-span-2">
        <template #content>
          <div class="p-4">
            <h3 class="text-lg font-medium mb-4">
              📅 Meal Rate (Last 12 Months)
            </h3>

            <Chart
              type="line"
              :data="chartData"
              :options="chartOptions"
              class="h-[30rem]"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";

import Chart from "primevue/chart";
const toast = useToast();
const selectedMonth = ref(new Date());
const selectedUser = ref(null);
const reports = ref([]);
const users = ref([]);
const mealRateHistory = ref([]);

// ✅ Summary
const summary = computed(() => {
  const totalAdvance = reports.value.reduce(
    (sum, r) => sum + r.totalAdvance,
    0
  );
  const totalExpense = reports.value.reduce(
    (sum, r) => sum + r.totalExpense,
    0
  );
  const totalMeals = reports.value.reduce(
    (sum, r) => sum + (r.totalMeals || 0),
    0
  );

  return {
    totalAdvance,
    totalExpense,
    totalMeals,
    balance: totalAdvance - totalExpense,
  };
});

// ✅ Meal Rate (from summary)
const mealRate = computed(() => {
  return summary.value.totalMeals > 0
    ? summary.value.totalExpense / summary.value.totalMeals
    : 0;
});

// ✅ Shortcut for template binding
const totalMeals = computed(() => summary.value.totalMeals);

// Fetch dashboard data
async function fetchDashboard() {
  try {
    const year = selectedMonth.value.getFullYear();
    const month = String(selectedMonth.value.getMonth() + 1).padStart(2, "0");
    const monthString = `${year}-${month}`;

    const query = selectedUser.value ? `&userId=${selectedUser.value}` : "";
    const res = await $fetch(`/api/v1/reports?month=${monthString}${query}`);

    reports.value = res.data;

    if (!users.value.length) {
      users.value = res.data.map((u) => ({
        _id: u.userId,
        name: u.name,
      }));
    }

    // fetch 12 months meal rate trend
    const trendRes = await $fetch(`/api/v1/reports/mealRates`);
    mealRateHistory.value = trendRes.data || [];
  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to load dashboard data",
      life: 3000,
    });
  }
}

const chartData = computed(() => ({
  labels: mealRateHistory.value.map((d) => d.month),
  datasets: [
    {
      label: "Meal Rate (tk/meal)",
      data: mealRateHistory.value.map((d) => d.mealRate),
      borderColor: "#42A5F5",
      tension: 0.4,
      fill: false,
    },
  ],
}));

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#495057",
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#495057" },
      grid: { color: "#ebedef" },
    },
    y: {
      ticks: { color: "#495057" },
      grid: { color: "#ebedef" },
    },
  },
});

// Export CSV
function exportCSV() {
  const header = ["User", "Advance", "Expense", "Meals", "Balance"];
  const rows = reports.value.map((r) => [
    r.name,
    r.totalAdvance,
    r.totalExpense,
    r.mealCount || 0,
    r.balance,
  ]);
  const csv = [header, ...rows].map((e) => e.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "dashboard_report.csv";
  link.click();
}

// Export PDF placeholder
function exportPDF() {
  toast.add({
    severity: "info",
    summary: "Coming Soon",
    detail: "PDF export not implemented yet.",
    life: 3000,
  });
}

onMounted(fetchDashboard);
</script>
