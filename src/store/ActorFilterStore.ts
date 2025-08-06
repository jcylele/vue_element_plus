import {defineStore} from "pinia";
import {ActorFilterData} from "../data/ActorFilterData";
import {getActorIds} from "../ctrls/DownloadCtrl";

interface ActorFilterState {
    filter_history: ActorFilterData[],
    page_info: PageInfo,
    downing_actor_id_list: number[],
    downing_actor_id_set: Set<number>,
}

interface PageInfo {
    page_size: number,
    page_index: number
}

const MAX_FILTER_HISTORY = 3

/**
 * 缓存筛选器，避免其他页面返回时被重置
 */
export const ActorFilterStore = defineStore('ActorFilterStore', {
    state: (): ActorFilterState => ({
        filter_history: [] as ActorFilterData[],
        page_info: {
            'page_size': 12,
            'page_index': 1,
        },
        downing_actor_id_list: [],
        downing_actor_id_set: new Set<number>(),
    }),
    getters: {
        last_filter: (state: ActorFilterState) => {
            if (state.filter_history.length === 0) {
                return undefined
            }
            return state.filter_history[state.filter_history.length - 1]
        },
        filter_list: (state: ActorFilterState) => {
            return state.filter_history
        },
        has_history: (state: ActorFilterState) => {
            return state.filter_history.length > 0
        },
        page_size: (state: ActorFilterState) => {
            return state.page_info.page_size
        },
        page_index: (state: ActorFilterState) => {
            return state.page_info.page_index
        },

        downing_actors: (state: ActorFilterState) => state.downing_actor_id_list,
        has_downing_actors: (state: ActorFilterState) => state.downing_actor_id_list.length > 0
    },
    actions: {
        saveFilter(filter: ActorFilterData) {
			// remove old same filter(ignore sort_items)
            for (const [index, f] of this.filter_history.entries()) {
                if (f.equals(filter)) {
                    this.filter_history.splice(index, 1)
					break
                }
            }
			// remove oldest filter
            if (this.filter_history.length >= MAX_FILTER_HISTORY) {
                this.filter_history.shift()
            }
            // break reference
            this.filter_history.push(filter.clone())

            // log
            // console.log(this.filter_history.map(f => f.str_desc_list).join(" || "))
        },
        selectFilter(uuid: number): ActorFilterData | undefined {
            for (const [index, filter] of this.filter_history.entries()) {
                if (filter.uuid === uuid) {
                    this.filter_history.splice(index, 1)
                    this.filter_history.push(filter)
                    return filter
                }
            }
            return undefined
        },
        setPageIndex(val: number) {
            this.page_info.page_index = val
        },
        setPageSize(val: number) {
            this.page_info.page_size = val
        },
        is_downing(actor_id: number) {
            return this.downing_actor_id_set.has(actor_id)
        },
        async getDowningFromServer() {
            const [ok, actor_ids] = await getActorIds()
            if (ok) {
                this.downing_actor_id_list = actor_ids
                this.downing_actor_id_set = new Set<number>(actor_ids)
            }
        }
    },
})
