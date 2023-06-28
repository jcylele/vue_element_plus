import {defineStore} from "pinia";
import ActorTagData from "../data/ActorTagData";
import {getActorTagList} from "../ctrls/ActorTagCtrl";
import {ElMessage} from "element-plus";

interface ActorTagState {
    list: ActorTagData[],
    dirty: boolean,
}

function compareActorTag(a: ActorTagData, b: ActorTagData): number {
    return b.tag_priority - a.tag_priority;
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
                state.list.sort(compareActorTag)
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
        getName(tag_id: number): string {
            for (const tag of this.list) {
                if (tag.tag_id === tag_id) {
                    return tag.tag_name
                }
            }
            return `Error(${tag_id})`
        },
        getColor(tag_id: number): string {
            for (const tag of this.list) {
                if (tag.tag_id === tag_id) {
                    return tag.tag_color
                }
            }
            return "#000000"
        },
    },
})
