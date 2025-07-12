export interface ISortItem {
    get key: number
    get priority: number
}

export interface CommonOption {
    label: string
    value: any
}

export interface NoticeColumn {
    col_name: string
    prop_name: string
}

export interface SortOption extends CommonOption {
    full_label: string
    default_asc: boolean
}

export interface SortGroup {
    label: string
    options: SortOption[]
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
