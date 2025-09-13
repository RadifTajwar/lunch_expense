<template>
  <div>
    <DataTable
      :value="rows"
      class="p-datatable-sm"
      tableStyle="min-width: 40rem"
    >
      <Column header="Select">
        <template #body="slotProps">
          <Checkbox
            :disabled="!hasPermission"
            :binary="true"
            :modelValue="slotProps.data.checked"
            @update:modelValue="(val) => updateChecked(slotProps.data._id, val)"
          />
        </template>
      </Column>

      <Column field="name" header="Name" />

      <Column header="Meal Count">
        <template #body="slotProps">
          <MealCountInput
            :hasPermission="hasPermission"
            :modelValue="slotProps.data.mealCount"
            :disabled="!slotProps.data.checked"
            @update:modelValue="
              (val) => updateMealCount(slotProps.data._id, val)
            "
          />
        </template>
      </Column>
    </DataTable>

    <div class="mt-3 flex justify-end" v-if="hasPermission">
      <Button
        :disabled="!hasUpdates || saving || !hasPermission"
        :label="saving ? '' : 'Save Attendances'"
        severity="primary"
        @click="onSaveClick"
      >
        <template v-if="saving" #default>
          <i class="pi pi-spin pi-spinner mr-2"></i> Saving...
        </template>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import MealCountInput from "./MealCountInput.vue";
const props = defineProps({
  mealId: { type: String, required: true },
  attendees: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  updatedAttendances: { type: Object, required: true },
  hasPermission: { type: Boolean, default: false },
  onSave: { type: Function, required: true },  // ✅ function prop
});


const saving = ref(false);

// ✅ Build reactive rows for display
const rows = computed(() =>
  props.users.map((user) => {
    const staged = props.updatedAttendances[props.mealId]?.[user._id];
    const attendee = props.attendees.find(
      (a) => String(a.userId?._id ?? a.userId) === String(user._id)
    );

    return {
      ...user,
      checked:
        staged?.checked ?? (attendee ? (attendee.mealCount ?? 0) > 0 : false),
      mealCount: staged?.mealCount ?? attendee?.mealCount ?? 1,
    };
  })
);

// ✅ Check if any updates exist
const hasUpdates = computed(() => {
  const staged = props.updatedAttendances[props.mealId] || {};
  return Object.keys(staged).length > 0;
});

function updateChecked(userId, checked) {
  if (!props.updatedAttendances[props.mealId]) {
    props.updatedAttendances[props.mealId] = {};
  }

  const existing = props.updatedAttendances[props.mealId][userId] || {};

  props.updatedAttendances[props.mealId][userId] = {
    ...existing,
    checked,
    mealCount: checked ? existing.mealCount ?? 1 : 1, // ✅ when unchecked, force 0
  };
}

function updateMealCount(userId, val) {
  if (!props.updatedAttendances[props.mealId]) {
    props.updatedAttendances[props.mealId] = {};
  }

  const existing = props.updatedAttendances[props.mealId][userId] || {};
  props.updatedAttendances[props.mealId][userId] = {
    ...existing,
    mealCount: Math.max(1, Number(val) || 1),
    checked: existing.checked ?? true, // auto-check if user types
  };
}

async function onSaveClick() {
  saving.value = true;

  const updates = rows.value.map((row) => ({
    userId: row._id,
    mealCount: row.checked ? row.mealCount : 0,
    checked: row.checked,
  }));

  try {
    await props.onSave({ mealId: props.mealId, updates }); // ✅ await works now
  } finally {
    saving.value = false;
    props.updatedAttendances[props.mealId] = {};
  }
}


</script>
