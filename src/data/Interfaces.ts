import {SortType} from "./Enums";

export interface ISortItem {
    get key: number
    get priority: number
}

export interface SortOption {
    id: number
    label: string
    sort_type: SortType
    sort_asc: boolean
}

export interface CommonOption {
    label: string
    value: any
}

export interface ActorPostInfo {
    actor_name: string
    post_count: number
}