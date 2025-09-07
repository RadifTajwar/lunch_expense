<template>
  <div class="p-6">
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
          <td class="border p-2 text-center">
            <button
              @click="removeUser(user._id)"
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </td>
        </tr>
        <tr v-if="users.length === 0 && !loading">
          <td colspan="5" class="text-center p-4">No users found</td>
        </tr>
      </tbody>
    </table>

    <div v-if="loading" class="flex justify-center items-center h-32">
      <ProgressSpinner
        style="width: 100px; height: 100px"
        strokeWidth="4"
        animationDuration=".8s"
      />
    </div>

    <!-- PrimeVue Toast -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import ProgressSpinner from "primevue/progressspinner";
const store = useStore();
const toast = useToast();

const form = ref({
  name: "",
  email: "",
  role: "member",
});

const users = computed(() => store.getters["users/allUsers"]);
const loading = computed(() => store.getters["users/isLoading"]);

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

// ❌ Delete user
async function removeUser(id) {
  try {
    await store.dispatch("users/deleteUser", id);

    toast.add({
      severity: "success",
      summary: "User Deleted",
      detail: `User removed successfully.`,
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: err.response?.data?.message || "Could not delete user.",
      life: 3000,
    });
  }
}
</script>
