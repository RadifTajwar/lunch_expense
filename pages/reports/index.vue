<template>
  <div class="pt-20 px-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold">📊 Monthly Reports</h2>

      <div class="flex gap-3">
        <!-- Month Picker -->
        <Calendar
          v-model="selectedMonth"
          view="month"
          dateFormat="yy-mm"
          placeholder="Select Month"
          class="w-40"
          @update:modelValue="fetchReports"
        />

        <!-- Export Buttons -->
        <Button
          label="Export CSV"
          icon="pi pi-file"
          severity="secondary"
          @click="exportCSV"
        />
        <Button
          label="Export PDF"
          icon="pi pi-file-pdf"
          severity="danger"
          @click="exportPDF"
        />
      </div>
    </div>

    <!-- Report Table -->
    <DataTable
      :value="reports"
      :loading="loading"
      paginator
      :rows="10"
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <Column field="userName" header="User" sortable />
      <Column field="totalAdvance" header="Advance Paid" sortable />
      <Column field="totalMeals" header="Meals" sortable />
      <Column field="totalExpense" header="Expense" sortable />
      <Column field="balance" header="Balance" sortable>
        <template #body="slotProps">
          <span
            :class="{
              'text-green-600 font-semibold': slotProps.data.balance >= 0,
              'text-red-600 font-semibold': slotProps.data.balance < 0,
            }"
          >
            {{ slotProps.data.balance.toFixed(2) }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const reports = ref([]);
const loading = ref(false);
const selectedMonth = ref(new Date()); // default to current month

async function fetchReports() {
  console.log("Fetching reports for month:", selectedMonth.value);
  if (!selectedMonth.value) return;

  loading.value = true;

  // ✅ Format month string using local time
  const year = selectedMonth.value.getFullYear();
  const month = String(selectedMonth.value.getMonth() + 1).padStart(2, "0");
  const monthString = `${year}-${month}`;

  console.log("Formatted month string:", monthString);

  try {
    const { data, error } = await $fetch(
      `/api/v1/reports?month=${monthString}`
    );

    // switched to $fetch since component is mounted

    reports.value = data.map((r) => ({
      ...r,
      userName: r.name,
    }));

    console.log("Fetched reports:", reports.value);
  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to load reports",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}

function exportCSV() {
  // simple CSV export
  const header = ["User", "Advance Paid", "Meals", "Expense", "Balance"];
  const rows = reports.value.map((r) => [
    r.userName,
    r.totalAdvance,
    r.totalMeals,
    r.totalExpense,
    r.balance,
  ]);
  const csv = [header, ...rows].map((e) => e.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "monthly_report.csv";
  link.click();
}

function exportPDF() {
  // TODO: can integrate jspdf / pdfmake
  toast.add({
    severity: "info",
    summary: "Coming Soon",
    detail: "PDF export not implemented yet.",
    life: 3000,
  });
}

onMounted(fetchReports);
</script>
