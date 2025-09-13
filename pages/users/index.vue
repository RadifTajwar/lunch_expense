<template>
  <div class="pt-20 px-6">
    <h1 class="text-2xl font-bold mb-4">Manage Users</h1>

    <!-- Add User Form -->
  <form
  @submit.prevent="addUser"
  class="mb-6 flex flex-wrap gap-4 items-end border p-4 rounded bg-gray-50"
>
    
  <div class="flex flex-col">
    <label class="block text-sm font-medium mb-1">Name</label>
    <input
      v-model="form.name"
      type="text"
      required
      class="border rounded p-2 w-56"
    />
  </div>

  <div class="flex flex-col">
    <label class="block text-sm font-medium mb-1">Email</label>
    <input
      v-model="form.email"
      type="email"
      required
      class="border rounded p-2 w-56"
    />
  </div>

 <div>
  <label class="block text-sm font-medium">Role</label>
  <Dropdown
    v-model="form.role"
    :options="[
      { label: 'Member', value: 'member' },
      { label: 'Admin', value: 'admin' }
    ]"
    optionLabel="label"
    optionValue="value"
    placeholder="Select role"
    class="w-40"
  />
</div>


  <div>
    <button
      type="submit"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Add User
    </button>
  </div>
</form>

<!-- 🔍 Filters -->
<div class="mb-6 flex flex-wrap gap-4 items-end border p-4 rounded bg-gray-50">
  <!-- Status -->
  <div class="flex flex-col">
    <label class="block text-sm font-medium mb-1">Status</label>
    <Dropdown
      v-model="filters.status"
      :options="[
        { label: 'All Users', value: 'all' },
        {label:'Current Users', value:'current'},
        { label: 'Active', value: 'active' },
        { label: 'Deleted', value: 'deleted' },
        { label: 'Inactive', value: 'inactive' }

      ]"
      optionLabel="label"
      optionValue="value"
      placeholder="Select status"
      class="w-40"
    />
  </div>

  <!-- Role -->
  <div class="flex flex-col">
    <label class="block text-sm font-medium mb-1">Role</label>
    <Dropdown
      v-model="filters.role"
      :options="[
        { label: 'All', value: '' },
        { label: 'Member', value: 'member' },
        { label: 'Admin', value: 'admin' }
      ]"
      optionLabel="label"
      optionValue="value"
      placeholder="Select role"
      class="w-40"
    />
  </div>

  <!-- Name -->
  <div class="flex flex-col">
    <label class="block text-sm font-medium mb-1">Name</label>
    <InputText v-model="filters.name" placeholder="Search by name" class="w-56" />
  </div>

  <!-- Email -->
  <div class="flex flex-col">
    <label class="block text-sm font-medium mb-1">Email</label>
    <InputText v-model="filters.email" placeholder="Search by email" class="w-56" />
  </div>

  <!-- Apply Filters -->
  <div>
    <Button
      label="Apply"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      @click="applyFilters"
    />
  </div>
</div>


    <!-- user table -->
 <DataTable
  :value="users"
  :loading="loading"
  paginator
  :rows="10"
  responsiveLayout="scroll"
  class="p-datatable-sm shadow-md rounded-xl overflow-hidden"
>
  <!-- Active -->
  <Column field="active" header="Active">
    <template #body="slotProps">
      <Checkbox
        :disabled="!canManageUsers || slotProps.data.deletedAt"
        :binary="true"
        :modelValue="slotProps.data.active"
        @update:modelValue="(val) => updateActive(slotProps.data, val)"
      />
    </template>
  </Column>

  <!-- Name -->
  <Column field="name" header="Name" sortable>
    <template #body="slotProps">
      <span :class="{ 'opacity-50': slotProps.data.deletedAt }"
            v-tooltip="slotProps.data.deletedAt ? 'This user is deleted' : ''">
        {{ slotProps.data.name }}
      </span>
    </template>
  </Column>

  <!-- Email -->
  <Column field="email" header="Email" sortable>
    <template #body="slotProps">
      <span :class="{ 'opacity-50': slotProps.data.deletedAt }"
            v-tooltip="slotProps.data.deletedAt ? 'This user is deleted' : ''">
        {{ slotProps.data.email }}
      </span>
    </template>
  </Column>

  <!-- Role -->
  <Column field="role" header="Role" sortable>
    <template #body="slotProps">
      <span
        class="capitalize"
        :class="{ 'opacity-50': slotProps.data.deletedAt }"
              v-tooltip="slotProps.data.deletedAt ? 'This user is deleted' : ''"
      >
        {{ slotProps.data.role }}
      </span>
    </template>
  </Column>

  <!-- Created At -->
  <Column field="createdAt" header="Created At" sortable>
    <template #body="slotProps">
      <span :class="{ 'opacity-50': slotProps.data.deletedAt }"
            v-tooltip="slotProps.data.deletedAt ? 'This user is deleted' : ''">
        {{ new Date(slotProps.data.createdAt).toLocaleDateString() }}
      </span>
    </template>
  </Column>

  <!-- Actions -->
  <Column header="Actions">
    <template #body="slotProps">
      <div class="flex gap-2 justify-center">
        <template v-if="slotProps.data.deletedAt">
          <!-- ♻️ Restore -->
          <Button
            label="Restore"
            severity="success"
            size="small"
            outlined
            @click="restoreUser(slotProps.data)"
          />
        </template>
        <template v-else>
          <!-- ✏️ Edit -->
          <Button
            label="Edit"
            severity="info"
            size="small"
            outlined
            @click="editUser(slotProps.data)"
          />
          <!-- ❌ Delete -->
          <Button
            label="Delete"
            severity="danger"
            size="small"
            outlined
            @click="confirmDelete(slotProps.data)"
          />
        </template>
      </div>
    </template>
  </Column>
</DataTable>

    <!-- Loader -->
    <div v-if="loading" class="flex justify-center items-center h-32">
      <ProgressSpinner
        style="width: 100px; height: 100px"
        strokeWidth="4"
        animationDuration=".8s"
      />
    </div>

    <!-- ✅ Delete Confirmation -->
    <Dialog
      v-model:visible="deleteVisible"
      header="Confirm Deletion"
      :style="{ width: '25rem' }"
     modal                 
  closable              
  :draggable="false"   
    dismissableMask="false"
    >
      <p class="mb-4">Are you sure you want to delete this user?</p>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="deleteVisible = false"
        />
        <Button
          type="button"
          label="Delete"
          severity="danger"
          @click="performDelete"
        />
      </div>
    </Dialog>
    

    <!-- ✅ Edit User Dialog -->
    <Dialog
      v-model:visible="editVisible"
      header="Edit User"
      :style="{ width: '30rem' }"
        modal                 
  closable              
  :draggable="false"   
    dismissableMask="false"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium">Name</label>
          <InputText v-model="editForm.name" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium">Email</label>
          <InputText v-model="editForm.email" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium">Role</label>
          <select v-model="editForm.role" class="border rounded p-2 w-full">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="editVisible = false"
        />
        <Button type="button" label="Save" @click="updateUser" />
      </div>
    </Dialog>

    <!-- PrimeVue Toast -->
    <Toast />
  </div>
</template>

<script setup>
defineOptions({ name: "UsersPage" });
definePageMeta({
  title: "Manage Users",
  layout: "default",
  authRequired: true,
});
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import ProgressSpinner from "primevue/progressspinner";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { PERMISSIONS } from "~/constants/permissions";
const store = useStore();
const toast = useToast();
const filters=ref({
  status:"",
  role:"",
  name:"",
  email:""

})
const form = ref({
  name: "",
  email: "",
  role: "member",
});

const users = computed(() => store.getters["users/allUsers"]);
const loading = computed(() => store.getters["users/isLoading"]);
// ✅ Permission check
const canManageUsers = computed(() =>
  store.getters["auth/userPermissions"].includes(
    PERMISSIONS.CAN_MANAGE_USERS
  )
);
const deleteVisible = ref(false);
const userToDelete = ref(null);

const restoreVisible = ref(false);
const userToRestore = ref(null);

const editVisible = ref(false);
const editForm = ref({ _id: "", name: "", email: "", role: "member" });

onMounted(() => {
  store.dispatch("users/fetchUsers");
});

// ➕ Add user
async function addUser() {
  try {
    await store.dispatch("users/createUser", form.value);

    toast.add({
      severity: "success",
      summary: "User Added",
      detail: `${form.value.name} has been created successfully.`,
      life: 3000,
    });

    form.value = { name: "", email: "", role: "member" };
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: err.response?.data?.message || "Could not create user.",
      life: 3000,
    });
  }
}

// ❌ Confirm delete
function confirmDelete(user) {
  userToDelete.value = user._id;
  deleteVisible.value = true;
}


const updateActive = (user, value) => {
  // Get the current user object

  console.log("Updating active for user:", user, "to", value);
  

  // Create payload with updated active value
  const payload = { ...user, active: value };

  // Call Vuex action to update user
  store
    .dispatch("users/updateUser", payload)
    .then(() => {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: `User ${value ? "activated" : "deactivated"} successfully.`,
        life: 3000,
      });
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Failed",
        detail: err.response?.data?.message || "Could not update user.",
        life: 3000,
      });
      console.error("❌ Failed to update active:", err);
    });
};
function applyFilters() {
  store.dispatch("users/fetchUsers", filters.value);
}

async function performDelete() {
  try {
    await store.dispatch("users/deleteUser", userToDelete.value);

    toast.add({
      severity: "success",
      summary: "User Deleted",
      detail: `User removed successfully.`,
      life: 3000,
    });
    deleteVisible.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: err.response?.data?.message || "Could not delete user.",
      life: 3000,
    });
  }
}

// ✏️ Edit user
function editUser(user) {
  editForm.value = { ...user };
  editVisible.value = true;
}

async function updateUser() {
  try {
    await store.dispatch("users/updateUser", editForm.value);

    toast.add({
      severity: "success",
      summary: "Updated",
      detail: "User updated successfully.",
      life: 3000,
    });
    editVisible.value = false;
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: err.response?.data?.message || "Could not update user.",
      life: 3000,
    });
  }
}

async function restoreUser(user) {
  try {
    const payload = { _id: user._id, deletedAt: null };

    await store.dispatch("users/updateUser", payload);

    toast.add({
      severity: "success",
      summary: "Restored",
      detail: "User restored successfully.",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: err.response?.data?.message || "Could not restore user.",
      life: 3000,
    });
  }
}

</script>
