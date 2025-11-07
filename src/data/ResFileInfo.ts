import BaseData from "./BaseData"
import { format_file_size, format_percent } from "./DataUtil"
import { ITableItem } from "./Interfaces"

export class ResFileInfo extends BaseData implements ITableItem {
	file_path: string = ""
	file_size: number = 0
	res_size: number = 0

	get percent(): number {
		return this.file_size / this.res_size
	}

	get key(): string {
		return this.file_path
	}

	constructor(json_data?: Record<string, any>) {
		super()
		if (json_data) {
			Object.assign(this, json_data)
		}
	}

	add(info: ResFileInfo) {
		this.file_size += info.file_size
		this.res_size += info.res_size
	}

	toSummaries(): string[] {
		return [
			this.file_path,
			format_file_size(this.file_size),
			format_file_size(this.res_size),
			format_percent(this.percent)
		]
	}

	sum(items: this[]): void {
		this.file_size = 0
		this.res_size = 0
		for (const item of items) {
			this.add(item)
		}
		this.file_path = `Total(${items.length})`
	}
}
