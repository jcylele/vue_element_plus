<template>
	<el-space direction="vertical" alignment="start" fill>
		<el-space direction="horizontal" alignment="start">
			<el-button type="primary" @click="toAddFolder">Add New Folder</el-button>
		</el-space>
		<div v-for="folder in fav_folder_store.sorted_list" class="common-group-item"
			@click="toActors(folder.folder_id)">
			<div class="split-row" style="border-bottom: solid 1px #e0e0e080;">
				<div class="center-row">
					<span class="common-group-name">
						{{ folder.folder_name }}
					</span>
					<svg-icon name="right" size="24px" @click.stop="toActors(folder.folder_id)" />
				</div>
				<div class="center-row">
					<svg-icon name="edit" size="24px" @click.stop="toEditFolder(folder)" />
					<svg-icon name="top" size="24px" @click.stop="moveFolder(folder.folder_id, true)" />
					<svg-icon name="bottom" size="24px" @click.stop="moveFolder(folder.folder_id, false)" />
				</div>
			</div>
			<p class="common-group-desc">
				{{ folder.folder_desc }}
			</p>
		</div>
	</el-space>
	<el-dialog v-model="is_editing" title="Add/Edit Folder" style="min-width: 600px;">
		<el-form label-width="100px">
			<el-form-item label="Name">
				<el-input v-model="edit_folder.folder_name" maxlength="30" show-word-limit />
			</el-form-item>
			<el-form-item label="Desc">
				<el-input v-model="edit_folder.folder_desc" type="textarea" maxlength="100" show-word-limit />
			</el-form-item>
			<el-form-item label="Op">
				<div class="split-row" style="padding: 10px">
					<div class="left-buttons">
						<el-button type="primary" @click="saveFolder">Save</el-button>
						<el-button type="warning" @click="stopEdit">Cancel</el-button>
					</div>
					<div class="right-button">
						<el-button type="danger" @click="delFolder">Delete</el-button>
					</div>
				</div>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>

<script setup lang="ts">
// imports
import { onMounted, Ref, ref } from "vue";
import { FolderData } from "../data/FolderData";
import { addFolder, deleteFolder, updateFolder, updatePriorities } from "../ctrls/FolderCtrl";
import { FavFolderStore } from "../store/FavFolderStore";
import { useRouter } from "vue-router";
import { ActorFilterData } from "../data/ActorFilterData";
import { EFilterRow } from "../data/Enums";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { swapGroup } from "../ctrls/BaseGroupCtrl";
// emits
// stores/routers
const router = useRouter()
const fav_folder_store = FavFolderStore()
const actor_filter_store = ActorFilterStore()
// props/models
// variables
const edit_folder = ref(new FolderData()) as Ref<FolderData>
const is_editing = ref(false)
// computed
// watch
// methods
async function saveFolder() {
	if (edit_folder.value.folder_id != 0) {
		const [ok, folder] = await updateFolder(edit_folder.value)
		if (ok) {
			fav_folder_store.update(folder)
			stopEdit()
		}
	} else {
		const [ok, folder] = await addFolder(edit_folder.value)
		if (ok) {
			fav_folder_store.add(folder)
			stopEdit()
		}
	}
}

async function delFolder() {
	const [ok, _] = await deleteFolder(edit_folder.value.folder_id)
	if (ok) {
		fav_folder_store.remove(edit_folder.value.folder_id)
		stopEdit()
	}
}

function stopEdit() {
	is_editing.value = false
}

function toAddFolder() {
	edit_folder.value.copy()
	is_editing.value = true
}

function toEditFolder(folder: FolderData) {
	edit_folder.value.copy(folder)
	is_editing.value = true
}

function toActors(folder_id: number) {
	const filter_condition = new ActorFilterData()
	filter_condition.folder_id = folder_id
	filter_condition.setRowVisible(EFilterRow.Folder, true)
	actor_filter_store.saveFilter(filter_condition)
	router.push("/actors")
}

async function moveFolder(folder_id: number, up: boolean) {
	const folder_list = fav_folder_store.sorted_list
	const priorities = swapGroup(folder_list, folder_id, up)
	if (priorities) {
		const [ok, succeed] = await updatePriorities(priorities)
		if (ok && succeed) {
			fav_folder_store.updatePriorities(priorities)
		} else {
			fav_folder_store.dirty()
		}
	}
}

// lifecycle

onMounted(async () => {
	await fav_folder_store.getFromServer()
})
</script>

<style scoped></style>