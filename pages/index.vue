<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import ProgressBar from "primevue/progressbar";
import ProgressSpinner from "primevue/progressspinner";
import { navigateTo } from "#app";

const store = useStore();
const toast = useToast();
const showSpinner = ref(false); // 🔹 controls overlay spinner

definePageMeta({
  layout: "unauth",
  authRequired: false,
  title: "Login",
});

async function handleLoginSuccess(response) {
  try {
    await store.dispatch("auth/logIn", response.credential);

    toast.add({
      severity: "success",
      summary: "Login Successful",
      detail: `Welcome ${store.getters["auth/userName"]}!`,
      life: 3000,
    });

    // Show spinner overlay while waiting
    showSpinner.value = true;

    setTimeout(() => {
      showSpinner.value = false;
      navigateTo("/dashboard");
    }, 3000);
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Login Failed",
      detail: "Something went wrong",
      life: 3000,
    });
  }
}
</script>

<template>
  <div class="w-full flex justify-center items-center h-screen bg-gray-100">
    <div
      class="bg-white border rounded py-8 px-6 text-center sm:w-4/5 md:w-1/2 lg:w-1/3"
    >
      <h1 class="mb-8 dashboard-title">Lunch Dashboard</h1>

      <!-- Google Button -->
      <GoogleSignInButton
        :disabled="store.getters['auth/isLoggingIn']"
        @success="handleLoginSuccess"
        @error="
          () =>
            toast.add({
              severity: 'error',
              summary: 'Login Failed',
              detail: 'Please try again.',
              life: 10000,
            })
        "
      />

      <!-- Progress bar during login -->
      <div v-if="store.getters['auth/isLoggingIn']" class="mt-6">
        <ProgressBar mode="indeterminate" style="height: 6px" />
        <p class="text-xl text-gray-900 mt-2 text-center">
          Logging in Please wait...
        </p>
      </div>
    </div>

    <Toast />

    <!-- 🔹 Full-screen overlay spinner -->
    <div
      v-if="showSpinner"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <ProgressSpinner
        style="width: 100px; height: 100px"
        strokeWidth="4"
        animationDuration=".8s"
      />
    </div>
  </div>
</template>
