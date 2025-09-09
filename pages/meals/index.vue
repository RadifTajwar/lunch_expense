<template>
  <div class="pt-20 px-6">
    <h2 class="text-xl font-semibold">Meals</h2>

    <!-- 🔄 Loader -->
    <div v-if="loading" class="flex justify-center items-center h-32">
      <ProgressSpinner
        style="width: 100px; height: 100px"
        strokeWidth="4"
        animationDuration=".8s"
      />
    </div>

    <!-- ✅ Show content only when NOT loading -->
    <div v-else>
      <!-- 🔍 Filters -->
      <div class="flex flex-wrap gap-4 mb-4 items-center">
        <input
          v-model="dateFilter"
          type="date"
          class="border rounded p-2 w-48"
          @input="fetchData(1)"
        />
        <input
          v-model="descriptionFilter"
          type="text"
          placeholder="Search by description"
          class="border rounded p-2 w-56"
          @input="fetchData(1)"
        />
        <input
          v-model="costFilter"
          type="number"
          placeholder="Search by cost"
          class="border rounded p-2 w-40"
          @input="fetchData(1)"
        />
      </div>

      <!-- ➕ Add Meal Form -->
      <div class="mb-6 border p-4 rounded bg-gray-50" v-if="canManageMeals">
        <h2 class="text-lg font-semibold mb-2">Add Meal</h2>

        <form
          @submit.prevent="addMeal"
          class="mb-6 flex flex-wrap gap-4 items-end border p-4 rounded bg-gray-50"
        >
          <div>
            <label class="block text-sm font-medium">Date</label>
            <input
              v-model="form.date"
              type="date"
              required
              class="border rounded p-2 w-56"
            />
          </div>

          <div>
            <label class="block text-sm font-medium">Description</label>
            <input
              v-model="form.description"
              type="text"
              class="border rounded p-2 w-56"
            />
          </div>

          <div>
            <label class="block text-sm font-medium">Total Cost</label>
            <input
              v-model="form.totalCost"
              type="number"
              step="0.01"
              required
              class="border rounded p-2 w-40"
            />
          </div>

          <button
            type="submit"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Meal
          </button>
        </form>
      </div>

      <!-- 🍽️ Meals Table -->
      <DataTable
        :value="meals"
        dataKey="_id"
        v-model:expandedRows="expandedRows"
        @rowExpand="onRowExpand"
        @rowCollapse="onRowCollapse"
        class="p-datatable-sm"
      >
        <!-- Expander Column -->
        <Column expander style="width: 3rem" />

        <!-- Meal Fields -->
        <Column field="date" header="Date">
          <template #body="slotProps">
            {{ slotProps.data.date.split("T")[0] }}
          </template>
        </Column>
        <Column field="description" header="Description" />
        <Column field="totalCost" header="Total Cost" />
        <!-- Total Meal Count -->
        <Column header="Total Meal Count">
          <template #body="slotProps">
            {{
              slotProps.data.attendees?.reduce(
                (sum, a) => sum + (a.mealCount || 0),
                0
              ) || 0
            }}
          </template>
        </Column>

        <!-- Per Person Rate -->
        <Column header="Per Person Rate">
          <template #body="slotProps">
            {{
              (() => {
                const totalMeals =
                  slotProps.data.attendees?.reduce(
                    (sum, a) => sum + (a.mealCount || 0),
                    0
                  ) || 0;
                return totalMeals > 0
                  ? (slotProps.data.totalCost / totalMeals).toFixed(2)
                  : "0.00";
              })()
            }}
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Actions" style="min-width: 12rem" v-if="canManageMeals">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                label="Edit"
                severity="info"
                size="small"
                @click="openEditMeal(slotProps.data)"
              />
              <Button
                label="Delete"
                severity="danger"
                size="small"
                @click="confirmDelete(slotProps.data._id)"
              />
            </div>
          </template>
        </Column>

        <!-- Expanded Row -->
        <template #expansion="slotProps">
          <div class="p-3 bg-gray-50 rounded-lg">
            <h5 class="mb-2 font-semibold">Manage Attendances</h5>
            <AttendanceTable
              :mealId="slotProps.data._id"
              :attendees="slotProps.data.attendees"
              :users="allUsers"
              :updatedAttendances="updatedAttendances"
              @save="saveAttendances"
              :hasPermission="canManageMeals"
            />
          </div>
        </template>
      </DataTable>

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
    </div>

    <!-- ✏️ Edit Modal -->
    <Dialog
      v-if="canManageMeals"
      v-model:visible="editVisible"
      header="Edit Meal"
      :style="{ width: '30rem' }"
      modal
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <label class="font-semibold w-24">Date</label>
          <input
            v-model="editForm.date"
            type="date"
            class="border rounded p-2 flex-auto"
          />
        </div>

        <div class="flex items-center gap-4">
          <label class="font-semibold w-24">Description</label>
          <input
            v-model="editForm.description"
            type="text"
            class="border rounded p-2 flex-auto"
          />
        </div>

        <div class="flex items-center gap-4">
          <label class="font-semibold w-24">Total Cost</label>
          <input
            v-model.number="editForm.totalCost"
            type="number"
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
        <Button label="Save" severity="success" @click="updateMeal" />
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
    <Toast />
  </div>
</template>

<script setup>
defineOptions({
  name: "MealsPage",
});

definePageMeta({
  layout: "default",
  authRequired: true,
  title: "Meals Management",
});

import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import ProgressSpinner from "primevue/progressspinner";
import AttendanceTable from "~/components/attendance/AttendanceTable.vue";
import { PERMISSIONS } from "~/constants/permissions";

const store = useStore();
const toast = useToast();

const expandedRows = ref([]);
const updatedAttendances = ref({});
const editVisible = ref(false);
const deleteVisible = ref(false);
const paymentToDelete = ref(null);

const form = ref({
  date: "",
  description: "",
  totalCost: "",
});

const editForm = ref({
  _id: null,
  date: "",
  description: "",
  totalCost: 0,
});

// 🔄 Loading state from Vuex
const loading = computed(() => store.getters["meals/isLoading"]);

const canManageMeals = computed(() =>
  store.getters["auth/userPermissions"].includes(PERMISSIONS.CAN_MANAGE_MEALS)
);

const dateFilter = computed({
  get: () => store.getters["meals/filters"].date,
  set: (val) => store.commit("meals/SET_FILTERS", { date: val }),
});
const descriptionFilter = computed({
  get: () => store.getters["meals/filters"].description,
  set: (val) => store.commit("meals/SET_FILTERS", { description: val }),
});
const costFilter = computed({
  get: () => store.getters["meals/filters"].cost,
  set: (val) => store.commit("meals/SET_FILTERS", { cost: val }),
});

// Meals + pagination
const page = computed(() => store.getters["meals/currentPage"]);
const totalPages = computed(() => store.getters["meals/totalPages"]);
const meals = computed(() => store.getters["meals/allMeals"]);
const allUsers = computed(() => store.getters["users/allUsers"]);

function fetchData(page = 1) {
  store.dispatch("users/fetchUsers");
  store.dispatch("meals/fetchMeals", page);
}

async function saveAttendances({ mealId, updates }) {
  try {
    await store.dispatch("meals/saveAttendances", { mealId, updates });
    toast.add({
      severity: "success",
      summary: "Attendances Saved",
      detail: "Attendance updated successfully.",
      life: 3000,
    });
  } catch (err) {
    console.error("❌ Error saving attendances:", err);
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: "Could not save attendances.",
      life: 3000,
    });
  }
}

function onRowExpand(event) {}
function onRowCollapse(event) {}

async function addMeal() {
  try {
    await store.dispatch("meals/createMeal", form.value);
    toast.add({
      severity: "success",
      summary: "Meal Added",
      detail: "Meal created successfully.",
      life: 3000,
    });
    form.value = { date: "", description: "", totalCost: "" };
  } catch {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: "Could not create meal.",
      life: 3000,
    });
  }
}

function openEditMeal(meal) {
  editForm.value = {
    _id: meal._id,
    date: meal.date.split("T")[0],
    description: meal.description,
    totalCost: meal.totalCost,
  };
  editVisible.value = true;
}

async function updateMeal() {
  try {
    await store.dispatch("meals/updateMeal", editForm.value);
    toast.add({
      severity: "success",
      summary: "Meal Updated",
      detail: "Meal updated successfully.",
      life: 3000,
    });
    editVisible.value = false;
  } catch (err) {
    console.error("❌ Error updating meal:", err);
    toast.add({
      severity: "error",
      summary: "Update Failed",
      detail: "Could not update meal.",
      life: 3000,
    });
  }
}

function confirmDelete(id) {
  paymentToDelete.value = id;
  deleteVisible.value = true;
}

async function performDelete() {
  try {
    await store.dispatch("meals/deleteMeal", paymentToDelete.value);
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

onMounted(() => {
  fetchData();
});
</script>
