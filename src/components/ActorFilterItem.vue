<template>
	<div class="desc-item">
		<el-text class="desc-label">{{ item.label }}</el-text>
		<el-text class="desc-value" truncated>{{ item.value }}</el-text>
	</div>
</template>

<script setup lang="ts">
// imports
import { FilterItem } from "../data/WebData";
// emits
// stores/routers
// props/models
const props = defineProps({
	item: {
		type: FilterItem,
		required: true
	}
})
// variables
// computed
// watch
// methods
// lifecycle
</script>

<style scoped>
.desc-item {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	align-items: stretch;
	width: auto;
}

.desc-label {
	font-size: var(--el-font-size-large);
	font-weight: bold;
	text-wrap: nowrap;
	color: black;
	background-color: burlywood;
	padding: 4px 4px;
}

.desc-value {
	font-size: var(--el-font-size-base);
	text-wrap: nowrap;
	color: black;
	background-color: antiquewhite;

	padding: 4px 8px;
	max-width: 160px;
}
</style>