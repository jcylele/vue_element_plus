import { BaseFileStats } from "./BaseFileStats"
import { format_file_size, format_percent } from "./DataUtil"
import { ITableItem } from "./Interfaces"

export class ResFileInfo extends BaseFileStats implements ITableItem {
	file_path: string = ""

	get key(): string {
		return this.file_path
	}

	constructor(json_data?: any) {
		super(json_data)
		this.file_path = json_data?.file_path ?? ""
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
		super.sum(items)
		this.file_path = `Total(${items.length})`
	}
}
