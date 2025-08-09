// src/store/createGroupStore.ts
import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { GroupEntity } from "../data/Interfaces"
import SortedList from "../data/SortedList"
import { CommonPriority } from "../data/WebData"

export default function createGroupStore<T extends GroupEntity>(
	storeId: string,
	getListFunc: () => Promise<[boolean, T[]]>
) {
	return defineStore(storeId, () => {
		const list = ref(new SortedList<T>([]))

		const sorted_list = computed(() => list.value.sorted_list)

		const count = computed(() => list.value.count)

		function add(item: T) {
			list.value.add(item)
		}

		function remove(key: number) {
			list.value.remove(key)
		}

		function update(item: T) {
			list.value.update(item)
		}

		function get(key: number): T {
			const item = list.value.get(key)
			if (item) {
				return item
			}
			throw new Error(`Group ${key} not found`)
		}

		function getName(key: number): string {
			const item = list.value.get(key)
			return item ? item.name : `Error: ${key}`
		}

		async function getFromServer() {
			const [ok, items] = await getListFunc()
			if (ok) {
				list.value = new SortedList<T>(items as T[])
			}
		}

		function dirty() {
			list.value.dirty()
		}

		function updatePriorities(priorities: CommonPriority[]) {
			for (const p of priorities) {
				const item = list.value.get(p.id)
				if (item) item.priority = p.priority
			}
			dirty()
		}

		return { sorted_list, count, add, remove, update, get, getName, getFromServer, dirty, updatePriorities }
	})
}