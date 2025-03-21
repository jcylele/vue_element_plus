import {defineStore} from "pinia";
import ActorTagData from "../data/ActorTagData";
import {getActorTagList} from "../ctrls/ActorTagCtrl";
import SortedList from "../data/SortedList";
import {Tag_Colors} from "../data/Consts";

const MAX_TAG_HISTORY = 12

export const ActorTagStore = defineStore('ActorTagStore', {
    state: () => ({
        list: null as SortedList<ActorTagData>,
        history_list: [] as number[],
    }),
    getters: {
        sorted_list: (state) => {
            if (!state.list) {
                return []
            }
            return state.list.sorted_list
        },
        tag_history: (state) => {
            const tag_id_arr: number[][] = []
            for (let i = 0; i < 10; i++) {
                tag_id_arr.push([])
            }

            for (const tag_id of state.history_list) {
                const tag: ActorTagData = state.get(tag_id)
                const group = Math.floor(tag.tag_priority / 100)
                tag_id_arr[group].push(tag.tag_id)
            }

            const tag_id_arr2: number[][] = []
            for (let i = 9; i >= 0; i--) {
                const tag_list = tag_id_arr[i]
                if (tag_list.length > 0) {
                    tag_list.sort(state.compareTagId)
                    tag_id_arr2.push(tag_list)
                }
            }
            return tag_id_arr2
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

        getStyle(tag_id: number) {
            return {
                "color": this.getBgColor(tag_id),
                "border-color": this.getBgColor(tag_id),
            }
        },

        getName(tag_id: number): string {
            const tag = this.get(tag_id)
            if (tag) {
                return tag.tag_name
            }
            return `Error(${tag_id})`
        },

        _addSingleTag(tag_id): void {
            let existing_index = this.history_list.indexOf(tag_id)
            // 0 is the oldest, -1 is newest
            if (existing_index != -1) {
                // already exist, move to end
                this.history_list.splice(existing_index, 1)
                this.history_list.push(tag_id)
            } else {
                // add if not full, otherwise replace
                if (this.history_list.length == MAX_TAG_HISTORY) {
                    this.history_list.shift()
                }
                this.history_list.push(tag_id)
            }
        },

        addRecord(tags: number[]) {
            for (const tag_id of tags) {
                this._addSingleTag(tag_id)
            }
        }
    },
})
