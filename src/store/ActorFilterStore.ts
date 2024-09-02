import {defineStore} from "pinia";
import ActorFilterData from "../data/ActorFilterData";

interface ActorFilterState {
    filter: ActorFilterData,
    page_info: PageInfo,
}

interface PageInfo {
    page_size: number,
    page_index: number
}

/**
 * 缓存筛选器，避免其他页面返回时被重置
 */
export const ActorFilterStore = defineStore('ActorFilterStore', {
    state: (): ActorFilterState => ({
        filter: null,
        page_info: {
            'page_size': 12,
            'page_index': 1,
        },
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
    },
    actions: {
        setFilter(filter: ActorFilterData) {
            this.filter = filter.clone()
        },
        setPageIndex(val: number) {
            this.page_info.page_index = val
        },
        setPageSize(val: number) {
            this.page_info.page_size = val
        }
    },
})
