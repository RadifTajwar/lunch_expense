<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Advance Payments</h1>

    <!-- 🔍 Filters -->
    <div class="flex flex-wrap gap-4 mb-4 items-center">
      <input
        v-model="nameFilter"
        type="text"
        placeholder="Search by name"
        class="border rounded p-2 w-48"
        @input="fetchData(1)"
      />
      <input
        v-model="emailFilter"
        type="text"
        placeholder="Search by email"
        class="border rounded p-2 w-48"
        @input="fetchData(1)"
      />
    </div>

    {{ canManagePayments }}

    <!-- 🚫 Add Payment is only visible for Admins -->
    <div v-if="canManagePayments" class="mb-6 border p-4 rounded bg-gray-50">
      <h2 class="text-lg font-semibold mb-2">Add Advance Payment</h2>
      <form @submit.prevent="addPayment">
        <div class="flex flex-wrap gap-4 mb-3">
          <!-- Select User -->
          <select
            v-model="form.userId"
            class="border rounded p-2 w-48"
            required
          >
            <option disabled value="">Select User</option>
            <option v-for="u in users" :key="u._id" :value="u._id">
              {{ u.name }} ({{ u.email }})
            </option>
          </select>

          <!-- Amount -->
          <input
            v-model.number="form.amount"
            type="number"
            placeholder="Amount"
            class="border rounded p-2 w-32"
            required
          />

          <!-- Tips -->
          <input
            v-model.number="form.tips"
            type="number"
            placeholder="Tips"
            class="border rounded p-2 w-32"
          />

          <!-- Date -->
          <input
            v-model="form.date"
            type="date"
            class="border rounded p-2"
            required
          />

          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </form>
    </div>

    <!-- 🔄 Loader -->
    <div v-if="loading" class="flex justify-center items-center h-32">
      <ProgressSpinner
        style="width: 100px; height: 100px"
        strokeWidth="4"
        animationDuration=".8s"
      />
    </div>

    <!-- 📊 Table -->
    <table v-else class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2">Name</th>
          <th class="border p-2">Email</th>
          <th class="border p-2">Amount</th>
          <th class="border p-2">Tips</th>
          <th class="border p-2">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in payments" :key="item._id" class="hover:bg-gray-50">
          <td>{{ item.userId?.name || "Deleted User" }}</td>
          <td>{{ item.userId?.email || "—" }}</td>
          <td class="border p-2">{{ item.amount }}</td>
          <td class="border p-2">{{ item.tips }}</td>
          <td class="border p-2">
            {{ new Date(item.date).toLocaleDateString() }}
          </td>
        </tr>
        <tr v-if="payments.length === 0">
          <td colspan="5" class="text-center p-4">No records found</td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-between items-center mt-4">
      <button
        :disabled="page <= 1"
        @click="fetchData(page - 1)"
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>
      <p>Page {{ page }} of {{ totalPages }}</p>
      <button
        :disabled="page >= totalPages"
        @click="fetchData(page + 1)"
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>

    <!-- ✅ PrimeVue Toast -->
    <Toast />
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { computed, ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { PERMISSIONS } from "@/constants/permissions";

const store = useStore();
const toast = useToast();

defineOptions({ name: "AdvancePaymentsPage" });

definePageMeta({
  layout: "default",
  authRequired: true,
  title: "Advance Payments",
});

// ✅ Permission check
const canManagePayments = computed(() =>
  store.getters["auth/userPermissions"].includes(
    PERMISSIONS.CAN_MANAGE_PAYMENTS
  )
);

// 🔹 Data from Vuex
const payments = computed(() => store.getters["advancePayments/allPayments"]);
const loading = computed(() => store.getters["advancePayments/isLoading"]); // loader binding
const page = computed(() => store.getters["advancePayments/currentPage"]);
const totalPages = computed(() => store.getters["advancePayments/totalPages"]);
const limit = computed({
  get: () => store.getters["advancePayments/pageSize"],
  set: (val) => store.commit("advancePayments/SET_LIMIT", val),
});

// 🔹 Users come directly from Vuex
const users = computed(() => store.getters["users/allUsers"]);

// Filters
const nameFilter = computed({
  get: () => store.getters["advancePayments/filters"].name,
  set: (val) => store.commit("advancePayments/SET_FILTERS", { name: val }),
});
const emailFilter = computed({
  get: () => store.getters["advancePayments/filters"].email,
  set: (val) => store.commit("advancePayments/SET_FILTERS", { email: val }),
});

// Add Payment Form
const form = ref({ userId: "", amount: null, tips: 0, date: "" });

async function fetchData(newPage = 1) {
  await store.dispatch("advancePayments/fetchPayments", newPage);
}

async function addPayment() {
  try {
    if (!form.value.userId || !form.value.amount || !form.value.date) {
      toast.add({
        severity: "warn",
        summary: "Missing Fields",
        detail: "Please fill all required fields",
        life: 3000,
      });
      return;
    }

    await store.dispatch("advancePayments/createPayment", form.value);

    toast.add({
      severity: "success",
      summary: "Payment Added",
      detail: "Advance payment created successfully",
      life: 3000,
    });

    form.value = { userId: "", amount: null, tips: 0, date: "" };
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to add payment",
      life: 3000,
    });
  }
}

onMounted(async () => {
  fetchData();
  await store.dispatch("users/fetchUsers"); // ✅ load users into Vuex
});
</script>
