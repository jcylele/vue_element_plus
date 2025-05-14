export interface ISortItem {
    get key: number
    get priority: number
}

export interface CommonOption {
    label: string
    value: any
}

export interface SortOption extends CommonOption {
    default_asc: boolean
}

export interface TagCount {
    tag_id: number,
    count: number
}

export interface TagRecord {
    tag_id: number,
    count: number,
    last_used: number
}
