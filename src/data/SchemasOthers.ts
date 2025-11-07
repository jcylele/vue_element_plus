import { DownloadLimitForm } from "./DownloadForms"
import { ECacheKey, ErrorCode, ResState } from "./Enums"

export interface IUnifiedResponse<T> {
	error_code: ErrorCode
	data: T | null
}

export interface INoticeCount {
	notice_type: number
	count: number
}

export interface ICommentCount {
	comment: string
	count: number
}


export interface IDownloadProgress {
	actor_count: number
	file_count: number
	total_file_size: number
}


export interface IDownloadLimit {
	limit: DownloadLimitForm
	progress: IDownloadProgress
}

export interface IDownloadTask {
	uid: number
	desc: string
	download_limit: IDownloadLimit
	worker_count: Map<string, number>
	queue_count: Map<string, number>
}

export interface ITagCount {
	tag_id: number
	count: number
}

export interface IDownloadingVideoStats {
	actor_id: number
	actor_name: string
	file_count: number
	file_size: number
	res_size: number
}

export interface IActorTagData {
	tag_id: number
	tag_name: string
	tag_priority: number
	used_count: number
	avg_score: number
	tag_group_id: number
}


export interface IResSizeCount {
	min: number
	max: number
	count_map: Map<ResState, number>
}

export interface ISettingItem {
    key: ECacheKey
    value: string|number|boolean
}

export interface IGroupTimeStats {
    stat_date: string
    actor_group_id: number
    actor_count: number
}

export interface IActorAbstract {
	actor_id: number
	actor_name: string
	actor_group_id: number
}

export interface IPostFetchTimeStats {
	stat_date: string
	post_count: number
}