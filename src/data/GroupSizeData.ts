import BaseData from "./BaseData";
import { format_file_size } from "./DataUtil";
import { ITableItem } from "./Interfaces";

export class GroupSizeData extends BaseData implements ITableItem {
	group_id: number = 0
	group_name: string = ""
	group_size: number = 0

	constructor(json_data?: Record<string, any>) {
		super()
		if (json_data) {
			Object.assign(this, json_data)
		}
	}
	get key(): string | number {
		return this.group_id
	}
	toSummaries(): string[] {
		return [
			this.group_name,
			format_file_size(this.group_size)
		]
	}
	sum(items: this[]): void {
		this.group_size = 0
		for (const item of items) {
			this.group_size += item.group_size
		}
		this.group_name = "Total"
	}
}