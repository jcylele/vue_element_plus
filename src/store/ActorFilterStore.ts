import {defineStore} from "pinia";
import {ActorFilterData} from "../data/ActorFilterData";
import {getActorIds} from "../ctrls/DownloadCtrl";

interface ActorFilterState {
    filter: ActorFilterData,
    page_info: PageInfo,
}

interface PageInfo {
    page_size: number,
    page_index: number
}

const MAX_FILTER_HISTORY = 10

/**
 * 缓存筛选器，避免其他页面返回时被重置
 */
export const ActorFilterStore = defineStore('ActorFilterStore', {
    state: (): ActorFilterState => ({
        filter: null as ActorFilterData,
        filter_history: [] as ActorFilterData[],
        filter_history_index: 0,
        page_info: {
            'page_size': 12,
            'page_index': 1,
        },
        downing_actor_id_list: [],
        downing_actor_id_set: new Set<number>(),
    }),
    getters: {
        filter_condition: (state: ActorFilterState) => {
            if (state.filter === null) {
                state.filter = new ActorFilterData()
            }
            return state.filter
        },
        page_size: (state: ActorFilterState) => {
            return state.page_info.page_size
        },
        page_index: (state: ActorFilterState) => {
            return state.page_info.page_index
        },
        has_history: (state: ActorFilterState) => {
            return state.filter_history.length > 0
        },
        downing_actors: (state: ActorFilterState) => state.downing_actor_id_list,
        has_downing_actors: (state: ActorFilterState) => state.downing_actor_id_list.length > 0
    },
    actions: {
        setFilter(filter: ActorFilterData) {
            // break reference
            this.filter = filter.clone()
            if (this.filter_history.length >= MAX_FILTER_HISTORY) {
                this.filter_history.shift()
            }
            this.filter_history.push(this.filter)
            this.filter_history_index = 0
        },
        getPreviousFilter(): ActorFilterData {
            this.filter_history_index++
            const len = this.filter_history.length
            if (len > this.filter_history_index) {
                return this.filter_history[len - this.filter_history_index]
            }
            return null
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
