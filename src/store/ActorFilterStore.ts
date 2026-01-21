import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { ActorFilterData } from "../data/ActorFilterData";
import { getActorIds } from "../ctrls/DownloadCtrl";

const MAX_FILTER_HISTORY = 6

/**
 * 缓存筛选器，避免其他页面返回时被重置
 */
export const ActorFilterStore = defineStore('ActorFilterStore', () => {
	const filter_history = ref<ActorFilterData[]>([])
	const page_size = ref(12)
	const page_index = ref(1)
	const downing_actor_id_list = ref<number[]>([])
	const downing_actor_id_set = ref(new Set<number>())

	const last_filter = computed(() => {
		if (filter_history.value.length === 0) {
			return undefined
		}
		return filter_history.value[filter_history.value.length - 1]
	})

	const has_history = computed(() => filter_history.value.length > 0)
	const has_downing_actors = computed(() => downing_actor_id_list.value.length > 0)

	function saveFilter(filter: ActorFilterData) {
		// remove old same filter(ignore sort_items)
		for (const [index, f] of filter_history.value.entries()) {
			if (f.equals(filter)) {
				filter_history.value.splice(index, 1)
				break
			}
		}
		// remove oldest filter
		if (filter_history.value.length >= MAX_FILTER_HISTORY) {
			filter_history.value.shift()
		}
		// break reference
		filter_history.value.push(filter.clone())
	}
	function selectFilter(uuid: number): ActorFilterData | undefined {
		for (const [index, filter] of filter_history.value.entries()) {
			if (filter.uuid === uuid) {
				filter_history.value.splice(index, 1)
				filter_history.value.push(filter)
				return filter as ActorFilterData
			}
		}
		return undefined
	}
	function removeFilter(uuid: number) {
		for (const [index, filter] of filter_history.value.entries()) {
			if (filter.uuid === uuid) {
				filter_history.value.splice(index, 1)
				return true
			}
		}
		return false
	}
	function is_downing(actor_id: number) {
		return downing_actor_id_set.value.has(actor_id)
	}
	async function getDowningFromServer() {
		const [ok, actor_ids] = await getActorIds()
		if (ok) {
			downing_actor_id_list.value = actor_ids
			downing_actor_id_set.value = new Set<number>(actor_ids)
		}
	}

	return {
		filter_history,
		downing_actor_id_list,
		page_size,
		page_index,

		last_filter,
		has_history,
		has_downing_actors,

		saveFilter,
		selectFilter,
		removeFilter,
		is_downing,
		getDowningFromServer,
	}
})
