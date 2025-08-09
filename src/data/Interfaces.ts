import BaseData from "./BaseData";
import { CommonGroupForm } from "./WebData"

export interface ISortItem {
	get key(): number
	get priority(): number
	set priority(priority: number)
}

export interface IGroupData {
	get name(): string
	copy(source?: this): void
	toForm(): CommonGroupForm
}

export type GroupEntity = BaseData & IGroupData & ISortItem;

export interface NoticeColumn {
	col_name: string
	prop_name: string
}

export interface CommonOption {
	label: string
	value: any
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


