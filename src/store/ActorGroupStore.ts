import {defineStore} from "pinia";
import ActorGroupData from "../data/ActorGroupData";
import {getActorGroupList} from "../ctrls/ActorGroupCtrl";
import SortedList from "../data/SortedList";


export const ActorGroupStore = defineStore('ActorGroupStore', {
    state: () => ({
        list: SortedList<ActorGroupData>
    }),
    getters: {
        sorted_list: (state) => {
            return state.list.sorted_list
        },
        down_list: (state) => {
            let ret = [] as ActorGroupData[]
            for (const item of state.list.sorted_list) {
                if (item.has_folder) {
                    ret.push(item)
                }
            }
            return ret
        }
    },
    actions: {
        add(actorGroup: ActorGroupData) {
            this.list.add(actorGroup)
        },
        update(actorGroup: ActorGroupData) {
            this.list.update(actorGroup)
        },
        remove(group_id: number) {
            this.list.remove(group_id)
        },
        get(group_id: number): ActorGroupData {
            return this.list.get(group_id)
        },
        getName(group_id: number): string {
            const group = this.get(group_id)
            if (group) {
                return group.group_name
            }
            return `Error(${group_id})`
        },
        getColor(group_id: number): string {
            const group = this.get(group_id)
            if (group) {
                return group.group_color
            }
            return "#000000"
        },
        async getFromServer() {
            const [ok, group_list] = await getActorGroupList()
            if (ok) {
                this.list = new SortedList(group_list)
            }
        },
    },
})
