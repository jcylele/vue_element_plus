<template>
	<el-space direction="vertical" alignment="start" fill>
		<el-text tag="p" style="font-style: italic;">click to add/remove actor to/from folder</el-text>
		<div v-for="folder in fav_folder_store.sorted_list" class="folder-item folder-selectable"
			:class="{ 'folder-selected': isSelected(folder.folder_id) }" @click="selectFolder(folder.folder_id)">
			<span class="folder-name" tag="b">
				{{ folder.folder_name }}
			</span>

			<span class="folder-desc" tag="p">
				{{ folder.folder_desc }}
			</span>
		</div>
	</el-space>
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

<style scoped></style>