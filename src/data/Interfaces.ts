import { BaseData } from "./BaseData";
import { EActorGroupFlag, ECacheKey, EConfirmOp, EFixFilter, EOtherOp, ESettingType } from "./Enums";
import { CommonGroupForm } from "./WebData"

export interface ITableItem {
	get key(): number | string
	toSummaries(): string[]
	sum(items: this[]): void
}

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

export interface NoticeTypeConfig {
	name: string
	tip: string
	btn_text?: string
	api_path?: string
	notice_columns: NoticeColumn[]
}

export interface CommonOption {
	label: string
	value: any
}

export interface FixOption {
	label: string
	value: EFixFilter
	tooltip: string
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


export interface OtherOp {
	op: EOtherOp
	label: string
	desc: string
	btn_text: string
	api_path?: string
}

export interface ConfirmOp {
	title: string
	content: string
}

export interface SettingItemConfig {
	key: ECacheKey
	label: string
	type: ESettingType
}

export interface ActorGroupFlagConfig {
	flag: EActorGroupFlag
	label: string
	desc: string
	icon: string
}

export interface ActorGroupAbstract {
	group_color: string
	has_folder: boolean
	is_initial: boolean
	show_video_info: boolean
}
