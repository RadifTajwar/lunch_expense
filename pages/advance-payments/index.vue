<template>
  <div class="pt-20 px-6">
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

    <!-- 🚫 Add Payment (Admins only) -->
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
              {{ u.name }}
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
    <table
      v-else
      class="w-full border-collapse border border-gray-300 bg-white"
    >
      <thead>
        <tr class="bg-white">
          <th class="border p-2">Name</th>
          <th class="border p-2">Email</th>
          <th class="border p-2">Amount</th>
          <th class="border p-2">Tips</th>
          <th class="border p-2">Date</th>
          <th v-if="canManagePayments" class="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in payments" :key="item._id" class="hover:bg-gray-50">
          <td class="border p-2">{{ item.userId?.name || "Deleted User" }}</td>
          <td class="border p-2">{{ item.userId?.email || "—" }}</td>
          <td class="border p-2 text-center">{{ item.amount }}</td>
          <td class="border p-2 text-center">{{ item.tips }}</td>
          <td class="border p-2 text-center">
            {{ new Date(item.date).toLocaleDateString() }}
          </td>
          <td v-if="canManagePayments" class="border p-2 text-center space-x-2">
            <Button
              label="Edit"
              severity="info"
              raised
              size="small"
              @click="editPayment(item)"
            />

            <Button
              label="Delete"
              severity="danger"
              raised
              size="small"
              @click="confirmDelete(item._id)"
            />
          </td>
        </tr>
        <tr v-if="payments.length === 0">
          <td colspan="6" class="text-center p-4">No records found</td>
        </tr>
      </tbody>
    </table>

    <!-- 📑 Pagination -->
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

    <!-- ✏️ Edit Modal -->
    <Dialog
      v-model:visible="editVisible"
      header="Edit Advance Payment"
      :style="{ width: '30rem' }"
      modal
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <label class="font-semibold w-24">User</label>
          <select
            v-model="editForm.userId"
            class="border rounded p-2 flex-auto bg-gray-100 text-gray-600 cursor-not-allowed"
            disabled
          >
            <option :value="editForm.userId">
              {{ editForm.user?.email || "Assigned User" }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-4">
          <label class="font-semibold w-24">Amount</label>
          <input
            v-model.number="editForm.amount"
            type="number"
            class="border rounded p-2 flex-auto"
          />
        </div>

        <div class="flex items-center gap-4">
          <label class="font-semibold w-24">Tips</label>
          <input
            v-model.number="editForm.tips"
            type="number"
            class="border rounded p-2 flex-auto"
          />
        </div>

        <div class="flex items-center gap-4">
          <label class="font-semibold w-24">Date</label>
          <input
            v-model="editForm.date"
            type="date"
            class="border rounded p-2 flex-auto"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="editVisible = false"
        />
        <Button label="Save" severity="success" @click="updatePayment" />
      </template>
    </Dialog>

    <!-- 🗑️ Delete Confirmation Modal -->
    <Dialog
      v-model:visible="deleteVisible"
      header="Confirm Delete"
      :style="{ width: '25rem' }"
      modal
    >
      <p>Are you sure you want to delete this payment?</p>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="deleteVisible = false"
        />
        <Button label="Delete" severity="danger" @click="performDelete" />
      </template>
    </Dialog>

    <!-- ✅ PrimeVue Toast -->
    <Toast />
  </div>
</template>

<script setup>
defineOptions({ name: "AdvancePaymentsPage" });

definePageMeta({
  layout: "default",
  authRequired: true,
  title: "Advance Payments",
});
import { useStore } from "vuex";
import { computed, ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { PERMISSIONS } from "@/constants/permissions";

const store = useStore();
const toast = useToast();

// ✅ Permission check
const canManagePayments = computed(() =>
  store.getters["auth/userPermissions"].includes(
    PERMISSIONS.CAN_MANAGE_PAYMENTS
  )
);

// 🔹 Data from Vuex
const payments = computed(() => store.getters["advancePayments/allPayments"]);
const loading = computed(() => store.getters["advancePayments/isLoading"]);
const page = computed(() => store.getters["advancePayments/currentPage"]);
const totalPages = computed(() => store.getters["advancePayments/totalPages"]);
const limit = computed({
  get: () => store.getters["advancePayments/pageSize"],
  set: (val) => store.commit("advancePayments/SET_LIMIT", val),
});

// 🔹 Users
const users = computed(() => store.getters["users/allUsers"]);

// 🔎 Filters
const nameFilter = computed({
  get: () => store.getters["advancePayments/filters"].name,
  set: (val) => store.commit("advancePayments/SET_FILTERS", { name: val }),
});
const emailFilter = computed({
  get: () => store.getters["advancePayments/filters"].email,
  set: (val) => store.commit("advancePayments/SET_FILTERS", { email: val }),
});

// ➕ Add Payment Form
const form = ref({ userId: "", amount: null, tips: 0, date: "" });

// ✏️ Edit Payment Modal
const editVisible = ref(false);
const editForm = ref({
  _id: "",
  userId: "",
  user: null, // 👈 store the full user object (with name, email, etc.)
  amount: null,
  tips: 0,
  date: "",
});

function editPayment(item) {
  editForm.value = {
    _id: item._id,
    userId: item.userId._id,
    user: item.userId,
    amount: item.amount,
    tips: item.tips,
    date: item.date.split("T")[0],
  };
  editVisible.value = true;
}

async function updatePayment() {
  try {
    const payload = {
      _id: editForm.value._id,
      userId: editForm.value.userId, // just the ID
      amount: editForm.value.amount,
      tips: editForm.value.tips,
      date: editForm.value.date,
    };

    await store.dispatch("advancePayments/updatePayment", payload);

    toast.add({
      severity: "success",
      summary: "Updated",
      detail: "Payment updated successfully",
      life: 3000,
    });

    editVisible.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to update payment",
      life: 3000,
    });
  }
}

// 🗑️ Delete Payment Modal
const deleteVisible = ref(false);
const paymentToDelete = ref(null);

function confirmDelete(id) {
  paymentToDelete.value = id;
  deleteVisible.value = true;
}

async function performDelete() {
  try {
    await store.dispatch(
      "advancePayments/deletePayment",
      paymentToDelete.value
    );

    toast.add({
      severity: "success",
      summary: "Deleted",
      detail: "Payment deleted successfully",
      life: 3000,
    });

    deleteVisible.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to delete payment",
      life: 3000,
    });
  }
}

// 📥 Fetch + Add Payment
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
      summary: "Added",
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

// 🚀 Init
onMounted(async () => {
  fetchData();
  await store.dispatch("users/fetchUsers");
});
</script>
