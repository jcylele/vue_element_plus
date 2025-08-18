import { defineStore } from "pinia";
import { ActorTagData } from "../data/ActorTagData";
import { getActorTagList } from "../ctrls/ActorTagCtrl";
import SortedList from "../data/SortedList";
import { Tag_Colors } from "../data/Consts";
import { TagRecord } from "../data/Interfaces";

const MAX_TAG_HISTORY = 12

export const ActorTagStore = defineStore('ActorTagStore', {
	state: () => ({
		list: new SortedList<ActorTagData>([]),
		history_list: [] as TagRecord[],
		last_used: 0
	}),
	getters: {
		sorted_list: (state) => {
			if (!state.list) {
				return []
			}
			return state.list.sorted_list
		},
		tag_history: (state) => {
			const tag_list_map: Map<number, number[]> = new Map()

			for (let i = 0; i < MAX_TAG_HISTORY; i++) {
				const tc = state.history_list[i]
				if (!tc) {
					break
				}
				const tag: ActorTagData = state.get(tc.tag_id)
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
					tag_list.sort(state.compareTagId)
					tag_id_arr.push(tag_list)
				}
			}
			return tag_id_arr
		}
	},
	actions: {
		add(actorTag: ActorTagData) {
			this.list.add(actorTag)
		},
		update(actorTag: ActorTagData) {
			this.list.update(actorTag)
		},
		remove(tag_id: number) {
			this.list.remove(tag_id)
		},
		get(tag_id: number): ActorTagData {
			return this.list.get(tag_id)
		},

		async getFromServer() {
			const [ok, tag_list] = await getActorTagList()
			if (ok) {
				this.list = new SortedList(tag_list)
			}
		},

		compareTagId(id_a: number, id_b: number): number {
			const tag_a = this.get(id_a)
			const tag_b = this.get(id_b)
			return this.list.compareItem(tag_a, tag_b)
		},

		getBgColor(tag_id: number): string {
			const tag = this.get(tag_id)
			if (tag) {
				const num = Math.floor(tag.tag_priority / 100)
				return Tag_Colors[num]
			}
			return "#000000"
		},

		getStyle(tag_id: number, selected: boolean = false) {
			const bg_color = this.getBgColor(tag_id)
			return selected ? {
				"color": "#ffffff",
				"border-color": "#000000",
				"background-color": bg_color,
			} : {
				"color": bg_color,
				"border-color": bg_color,
				"background-color": "transparent",
			}
		},

		getName(tag_id: number): string {
			const tag = this.get(tag_id)
			if (tag) {
				return tag.tag_name
			}
			return `Error(${tag_id})`
		},

		getTagIdsInGroup(group_id: number): number[] {
			return this.list.sorted_list.filter(tag => tag.tag_group_id == group_id).map(tag => tag.tag_id)
		},

		_addSingleTag(tag_id): void {
			let existing_tc = this.history_list.find(tc => tc.tag_id == tag_id)
			if (existing_tc != undefined) {
				existing_tc.count++
				existing_tc.last_used = ++this.last_used
			} else {
				this.history_list.push({ tag_id: tag_id, count: 1, last_used: ++this.last_used })
			}
		},

		addRecord(tags: number[]) {
			for (const tag_id of tags) {
				this._addSingleTag(tag_id)
			}
			// sort by count desc, last_used desc
			this.history_list.sort((a, b) => {
				if (a.count != b.count) {
					return b.count - a.count
				} else {
					return b.last_used - a.last_used
				}
			})
		},

		clearHistory() {
			this.history_list = []
		}
	},
})
