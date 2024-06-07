import {defineStore} from "pinia";
import ActorTagData from "../data/ActorTagData";
import {getActorTagList, getTagUsedCount} from "../ctrls/ActorTagCtrl";
import {ElMessage} from "element-plus";

interface ActorTagState {
    list: ActorTagData[],
    dirty: boolean,
}

export const ActorTagStore = defineStore('ActorTagStore', {
    state: (): ActorTagState => ({
        list: [] as ActorTagData[],
        dirty: false,
    }),
    getters: {
        sorted_list: (state: ActorTagState) => {
            if (state.dirty) {
                state.dirty = false
                state.list.sort(state.compareActorTag)
            }
            return state.list
        },
    },
    actions: {
        add(actorTag: ActorTagData) {
            this.list.push(actorTag)
            this.dirty = true
        },
        update(actorTag: ActorTagData, index: number) {
            this.list[index] = actorTag
            this.dirty = true
        },
        remove(index: number) {
            this.list.splice(index, 1)
        },
        async getFromServer() {
            const [ok, tag_list] = await getActorTagList()
            if (ok) {
                this.list = tag_list as ActorTagData[]
                this.dirty = true
            } else {
                ElMessage(tag_list as string)
            }
        },
        getTag(tag_id: number): ActorTagData {
            for (const tag of this.list) {
                if (tag.tag_id === tag_id) {
                    return tag
                }
            }
            return null;
        },
        getName(tag_id: number): string {
            const tag = this.getTag(tag_id)
            if (tag) {
                return tag.tag_name
            }
            return `Error(${tag_id})`
        },

        getTagPriority(tag_id: number): number {
            const tag = this.getTag(tag_id)
            if (tag) {
                return tag.tag_priority
            }
            return 0
        },

        getColorStyleName(tag_id: number): string {
            const tag = this.getTag(tag_id)
            if (tag) {
                const num = Math.floor(tag.tag_priority / 10)
                return `tag_${num}`
            }
            return "tag_error"
        },

        sortTagIds(tag_ids: number[]): number[] {
            const tag_list = this.list.slice()
            tag_list.sort(this.compareActorTagId)
        },

        compareActorTag(a: ActorTagData, b: ActorTagData): number {
            return b.tag_priority - a.tag_priority;
        },

        compareActorTagId(a: number, b: number): number {
            const tag_a = this.getTag(a)
            const tag_b = this.getTag(b)
            if (tag_a && tag_b) {
                const ret = this.compareActorTag(tag_a, tag_b)
                if (ret === 0) {
                    return a - b
                }
                return ret
            }
            return 0
        }
    },
})
