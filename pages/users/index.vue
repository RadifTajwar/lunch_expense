<template>
  <div class="pt-20 px-6">
    <h1 class="text-2xl font-bold mb-4">Manage Users</h1>

    <!-- Add User Form -->
    <form
      @submit.prevent="addUser"
      class="mb-6 flex flex-wrap gap-4 items-end border p-4 rounded bg-gray-50"
    >
      <div>
        <label class="block text-sm font-medium">Name</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="border rounded p-2 w-56"
        />
      </div>

      <div>
        <label class="block text-sm font-medium">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="border rounded p-2 w-56"
        />
      </div>

      <div>
        <label class="block text-sm font-medium">Role</label>
        <select v-model="form.role" class="border rounded p-2 w-40">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add User
      </button>
    </form>

    <!-- Users Table -->
    <table
      v-if="!loading"
      class="w-full border-collapse border border-gray-300"
    >
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2">Name</th>
          <th class="border p-2">Email</th>
          <th class="border p-2">Role</th>
          <th class="border p-2">Created At</th>
          <th class="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50">
          <td class="border p-2">{{ user.name }}</td>
          <td class="border p-2">{{ user.email }}</td>
          <td class="border p-2 capitalize">{{ user.role }}</td>
          <td class="border p-2">
            {{ new Date(user.createdAt).toLocaleDateString() }}
          </td>
          <td class="border p-2 text-center space-x-2">
            <!-- ✏️ Edit -->
            <Button
              label="Edit"
              severity="info"
              raised
              size="small"
              @click="editUser(user)"
            />
            <!-- ❌ Delete -->
            <Button
              label="Delete"
              severity="danger"
              raised
              size="small"
              @click="confirmDelete(user)"
            />
          </td>
        </tr>
        <tr v-if="users.length === 0 && !loading">
          <td colspan="5" class="text-center p-4">No users found</td>
        </tr>
      </tbody>
    </table>

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

const store = useStore();
const toast = useToast();

const form = ref({
  name: "",
  email: "",
  role: "member",
});

const users = computed(() => store.getters["users/allUsers"]);
const loading = computed(() => store.getters["users/isLoading"]);

const deleteVisible = ref(false);
const userToDelete = ref(null);

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
</script>
