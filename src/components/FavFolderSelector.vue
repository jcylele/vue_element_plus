<template>
	<div class="fill-column">
		<el-text tag="p" style="font-style: italic;">click to add/remove actor to/from folder</el-text>
		<div v-for="folder in fav_folder_store.sorted_list" class="common-group-item group-selectable small"
			:class="{ 'group-selected': isSelected(folder.folder_id) }" @click="selectFolder(folder.folder_id)">
			<span class="common-group-name">
				{{ folder.folder_name }}
			</span>

			<p class="common-group-desc">
				{{ folder.folder_desc }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
// imports
import { FavFolderStore } from "../store/FavFolderStore";
// emits
const emit = defineEmits(['select'])
// stores/routers
const fav_folder_store = FavFolderStore()
// props/models
const props = defineProps({
	selected_folder_ids: {
		type: Array<number>,
		default: () => []
	}
})
// variables
// computed
// watch
// methods
function selectFolder(folder_id: number) {
	emit('select', folder_id)
}

function isSelected(folder_id: number) {
	return props.selected_folder_ids.includes(folder_id)
}
// lifecycle
</script>



<style scoped>
.common-group-item.small {
	padding: 5px 5px;
	gap: 3px;
}
</style>