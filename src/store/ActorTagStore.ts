import {defineStore} from "pinia";
import ActorTagData from "../data/ActorTagData";
import {getActorTagList} from "../ctrls/ActorTagCtrl";
import SortedList from "../data/SortedList";

export const ActorTagStore = defineStore('ActorTagStore', {
    state: () => ({
        list: SortedList<ActorTagData>
    }),
    getters: {
        sorted_list: (state: ActorTagState) => {
            if (!state.list) {
                return []
            }
            return state.list.sorted_list
        },
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

        getStyleName(tag_id: number): string {
            const tag = this.get(tag_id)
            if (tag) {
                const num = Math.floor(tag.tag_priority / 100)
                return `tag_${num}`
            }
            return "tag_error"
        },

        getName(tag_id: number): string {
            const tag = this.get(tag_id)
            if (tag) {
                return tag.tag_name
            }
            return `Error(${tag_id})`
        },
    },
})
