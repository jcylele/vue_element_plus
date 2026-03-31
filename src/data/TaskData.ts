import { BaseData } from "./BaseData";
import { Task_Type_Descs } from "./Consts";
import { format_file_size } from "./DataUtil";
import { DownloadLimitForm } from "./DownloadForms";
import { PostFilter, ResType, TaskType } from "./Enums";
import { IActorAbstract, ICommonCount, IDownloadLimit, IDownloadTask, IWorkerProcessStats } from "./SchemasOthers";

export class DownloadProgress extends BaseData {
	actor_count: number
	post_count: number
	file_count: number
	total_file_size: number
}

export class DownloadLimit extends BaseData {
	private limit: DownloadLimitForm
	private progress: DownloadProgress

	constructor(json_data?: IDownloadLimit) {
		super(json_data);
		if (json_data) {
			this.limit = new DownloadLimitForm(json_data.limit)
			this.progress = new DownloadProgress(json_data.progress)
		}
	}

	get limit_desc_list(): string[] {
		const desc_list: string[] = []
		// actor count
		if (this.limit.actor_count > 0) {
			desc_list.push(`${this.progress.actor_count}/${this.limit.actor_count} actors`)
		} else if (this.progress.actor_count > 0) {
			desc_list.push(`${this.progress.actor_count} actors`)
		}
		// post count
		if (this.limit.post_filter == PostFilter.Completed) {
			desc_list.push("completed posts")
		} else if (this.limit.post_filter == PostFilter.Current) {
			desc_list.push("current posts")
		} else {
			if (this.limit.post_count > 0) {
				desc_list.push(`${this.progress.post_count}/${this.limit.post_count} posts`)
			} else {
				desc_list.push(`${this.progress.post_count} posts`)
			}
		}

		// file count / res type
		let str_desc = ResType[this.limit.res_type]
		if (this.limit.file_count > 0) {
			str_desc = `${this.progress.file_count} / ${this.limit.file_count} ${str_desc}`
		} else if (this.progress.file_count > 0) {
			str_desc = `${this.progress.file_count} ${str_desc}`
		}
		desc_list.push(str_desc)

		// single file size range
		const minVal = this.limit.single_file_size_min
		const maxVal = this.limit.single_file_size_max
		if (minVal > 0 || maxVal > 0) {
			const minSize = minVal > 0 ? format_file_size(minVal) : ""
			const maxSize = maxVal > 0 ? format_file_size(maxVal) : ""

			if (minVal > 0 && maxVal > 0) {
				desc_list.push(`${minSize} < single < ${maxSize}`)
			} else if (minVal === 0 && maxVal > 0) {
				desc_list.push(`single < ${maxSize}`)
			} else if (minVal > 0 && maxVal === 0) {
				desc_list.push(`single > ${minSize}`)
			}
		}

		// total file size
		if (this.limit.total_file_size > 0) {
			const progress = format_file_size(this.progress.total_file_size)
			const limit = format_file_size(this.limit.total_file_size)
			desc_list.push(`total ${progress} / ${limit}`)
		} else if (this.progress.total_file_size > 0) {
			const progress = format_file_size(this.progress.total_file_size)
			desc_list.push(`total ${progress}`)
		}

		return desc_list
	}
}

export class TaskData extends BaseData {
	uid: number
	type: TaskType
	arg: number
	download_limit: DownloadLimit
	worker_count: ICommonCount[]
	queue_count: ICommonCount[]
	actor_abstract: IActorAbstract | undefined
	worker_process_stats: IWorkerProcessStats[]

	constructor(json_data?: IDownloadTask) {
		super(json_data);
		if (json_data) {
			this.download_limit = new DownloadLimit(json_data.download_limit)
		}
	}

	get desc(): string {
		return Task_Type_Descs[this.type]
	}

	get group_id(): number {
		if (this.actor_abstract) {
			return this.actor_abstract.actor_group_id
		}
		return this.arg
	}

	get show_group_name(): boolean {
		return this.type === TaskType.Group
	}

	get show_actor_name(): boolean {
		return this.type < TaskType.MaxSingleActor
	}
}