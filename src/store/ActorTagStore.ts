import { defineStore } from "pinia";
import { ActorTagData } from "../data/ActorTagData";
import { getActorTagList } from "../ctrls/ActorTagCtrl";
import { SortedList } from "../data/SortedList";
import { Tag_Colors } from "../data/Consts";
import { TagRecord } from "../data/Interfaces";
import { computed, ref } from "vue";
import { ActorTagFilter } from "../data/ActorTagFilter";

const MAX_TAG_HISTORY = 12

export const ActorTagStore = defineStore('ActorTagStore', () => {
	const list = ref(new SortedList<ActorTagData>([]))
	const history_list = ref<TagRecord[]>([])
	const last_used = ref(0)

	const max_used_count = computed(() => {
		return list.value.sorted_list.reduce((max, tag) => Math.max(max, tag.used_count), 0)
	})

	const sorted_list = computed(() => list.value.sorted_list)

	const tag_history = computed(() => {
		const tag_list_map: Map<number, number[]> = new Map()

		for (let i = 0; i < MAX_TAG_HISTORY; i++) {
			const tc = history_list.value[i]
			if (!tc) {
				break
			}
			const tag: ActorTagData = get(tc.tag_id)
			const group = Math.floor(tag.tag_priority / 100)
			if (!tag_list_map[group]) {
				tag_list_map[group] = [tag.tag_id]
			} else {
				tag_list_map[group].push(tag.tag_id)
			}
		}

		const tag_id_arr: number[][] = []
		for (let i = 0; i < 10; i++) {
			const tag_list = tag_list_map[i]
			if (tag_list) {
				tag_list.sort(compareTagId)
				tag_id_arr.push(tag_list)
			}
		}
		return tag_id_arr
	})


	function add(actorTag: ActorTagData) {
		list.value.add(actorTag)
	}
	function update(actorTag: ActorTagData) {
		list.value.update(actorTag)
	}
	function remove(tag_id: number) {
		list.value.remove(tag_id)
	}
	function get(tag_id: number): ActorTagData {
		return list.value.get(tag_id)!
	}

	async function getFromServer() {
		const [ok, tag_list] = await getActorTagList()
		if (ok) {
			list.value = new SortedList(tag_list)
		}
	}

	function compareTagId(id_a: number, id_b: number): number {
		const tag_a = get(id_a)
		const tag_b = get(id_b)
		return list.value.compareItem(tag_a, tag_b)
	}

	function getBgColor(tag_id: number): string {
		const tag = get(tag_id)
		if (tag) {
			const num = Math.floor(tag.tag_priority / 100)
			return Tag_Colors[num]
		}
		return "#000000"
	}

	function getStyle(tag_id: number, selected: boolean = false) {
		const bg_color = getBgColor(tag_id)
		return selected ? {
			"color": "#ffffff",
			"border-color": "#000000",
			"background-color": bg_color,
		} : {
			"color": bg_color,
			"border-color": bg_color,
			"background-color": "transparent",
		}
	}

	function getName(tag_id: number): string {
		const tag = get(tag_id)
		if (tag) {
			return tag.tag_name
		}
		return `Error(${tag_id})`
	}

	function getTagIdsInGroup(group_id: number): number[] {
		return list.value.sorted_list.filter(tag => tag.tag_group_id == group_id).map(tag => tag.tag_id)
	}

	function _addSingleTag(tag_id): void {
		let existing_tc = history_list.value.find(tc => tc.tag_id == tag_id)
		if (existing_tc != undefined) {
			existing_tc.count++
			existing_tc.last_used = ++last_used.value
		} else {
			history_list.value.push({ tag_id: tag_id, count: 1, last_used: ++last_used.value })
		}
	}

	function addRecord(tags: number[]) {
		for (const tag_id of tags) {
			_addSingleTag(tag_id)
		}
		// sort by count desc, last_used desc
		history_list.value.sort((a, b) => {
			if (a.count != b.count) {
				return b.count - a.count
			} else {
				return b.last_used - a.last_used
			}
		})
	}

	function clearHistory() {
		history_list.value = []
	}

	function getDefaultFilter(): ActorTagFilter {
		const filter = new ActorTagFilter()
		filter.maxUsedCount = max_used_count.value
		return filter
	}

	return {
		sorted_list,
		tag_history,
		add,
		update,
		remove,
		get,
		getFromServer,
		compareTagId,
		getBgColor,
		getStyle,
		getName,
		getTagIdsInGroup,
		addRecord,
		clearHistory,
		getDefaultFilter
	}
})
