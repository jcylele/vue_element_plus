import { BaseFileStats } from "./BaseFileStats"
import { format_file_size, format_percent } from "./DataUtil"
import { ITableItem } from "./Interfaces"
import { IActorAbstract } from "./SchemasOthers"

export default class DownloadingVideoStats extends BaseFileStats implements ITableItem {
	actor_abstract: IActorAbstract

	get actor_id(): number {
		return this.actor_abstract?.actor_id ?? 0
	}

	get actor_name(): string {
		return this.actor_abstract?.actor_name ?? ""
	}

	get actor_group_id(): number {
		return this.actor_abstract?.actor_group_id ?? 0
	}

	get key(): number {
		return this.actor_id
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
		super.sum(items)
		this.actor_abstract = {
			actor_id: 0,
			actor_name: "Total",
			actor_group_id: 0
		}
	}
}