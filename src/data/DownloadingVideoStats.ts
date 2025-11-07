import BaseData from "./BaseData"
import { format_file_size, format_percent } from "./DataUtil"
import { ITableItem } from "./Interfaces"
import { IDownloadingVideoStats, IActorAbstract } from "./SchemasOthers"

export default class DownloadingVideoStats extends BaseData implements ITableItem {
	actor_abstract: IActorAbstract
	file_count: number = 0
	file_size: number = 0
	res_size: number = 0

	get actor_id(): number {
		return this.actor_abstract?.actor_id ?? 0
	}

	get actor_name(): string {
		return this.actor_abstract?.actor_name ?? ""
	}

	get actor_group_id(): number {
		return this.actor_abstract?.actor_group_id ?? 0
	}

	get percent(): number {
		return this.file_size / this.res_size
	}

	get key(): number {
		return this.actor_id
	}

	constructor(json_data?: IDownloadingVideoStats) {
		// 1. 先调用super()，完成父类的初始化
		super()
		if (json_data) {
			// 2. 在属性默认值设置好后，再用json_data来覆盖
			Object.assign(this, json_data)
		}
	}
	toSummaries(): string[] {
		return [
			this.actor_name,
			this.file_count.toString(),
			format_file_size(this.file_size),
			format_file_size(this.res_size),
			format_percent(this.percent)
		]
	}
	sum(items: this[]): void {
		this.actor_abstract = {
			actor_id: 0,
			actor_name: "Total",
			actor_group_id: 0
		}
		this.file_count = 0
		this.file_size = 0
		this.res_size = 0
		for (const item of items) {
			this.add(item)
		}
	}

	add(info: DownloadingVideoStats) {
		this.file_count += info.file_count
		this.file_size += info.file_size
		this.res_size += info.res_size
	}

	remove(info: DownloadingVideoStats) {
		this.file_count -= info.file_count
		this.file_size -= info.file_size
		this.res_size -= info.res_size
	}
}