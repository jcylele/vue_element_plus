import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { FolderData } from "../data/FolderData"
import { getFolders } from "../ctrls/FolderCtrl"
import SortedList from "../data/SortedList"

export const FavFolderStore = defineStore('FavFolderStore', () => {
	const list = ref<SortedList<FolderData>>(new SortedList<FolderData>([]))

	const sorted_list = computed(() => {
		return list.value.sorted_list
	})

	function add(folder: FolderData) {
		list.value.add(folder)
	}

	function remove(folder_id: number) {
		list.value.remove(folder_id)
	}

	function update(folder: FolderData) {
		list.value.update(folder)
	}

	function get(folder_id: number): FolderData {
		return list.value.get(folder_id)
	}

	function getName(folder_id: number): string {
		const folder = list.value.get(folder_id)
		if (folder) {
			return folder.folder_name
		}
		return `Error: ${folder_id}`
	}

	async function getFromServer() {
		const [ok, folders] = await getFolders()
		if (ok) {
			list.value = new SortedList<FolderData>(folders)
		}
	}

	return { sorted_list, add, remove, update, get, getName, getFromServer }
})