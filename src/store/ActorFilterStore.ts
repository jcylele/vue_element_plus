import {defineStore} from "pinia";
import ActorFilterData from "../data/ActorFilterData";

interface ActorFilterState {
    filter: ActorFilterData,
}

export const ActorFilterStore = defineStore('ActorFilterStore', {
    state: (): ActorFilterState => ({
        filter: null
    }),
    getters: {
        filter_condition: (state: ActorFilterState) => {
            if (state.filter === null) {
                state.filter = new ActorFilterData()
            }
            return state.filter
        },
    },
    actions: {
        setFilterCondition(filter: ActorFilterData) {
            this.filter = filter.clone()
        }
    },
})
