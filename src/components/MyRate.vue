<template>
	<el-rate v-model="model" :colors="Star_Colors" :max="6" allow-half v-bind="$attrs" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Star_Colors } from "../data/Consts";


const props = defineProps({
	modelValue: {
		type: Number,
		required: true,
	},
})
const emits = defineEmits(["update:modelValue"])

const model = computed({
	get() {
		return props.modelValue;
	},
	set(value: number) {
		emits("update:modelValue", value);
	},
})


</script>