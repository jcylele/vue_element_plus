import { BaseData } from "./BaseData"

export class BaseFileStats extends BaseData {
	file_count: number = 1
	file_size: number = 0
	res_size: number = 0

	get percent(): number {
		return this.file_size / this.res_size
	}

	constructor(json_data?: any) {
		super()
		if (json_data) {
			Object.assign(this, json_data)
		}
	}

	add(info: this) {
		this.file_count += info.file_count
		this.file_size += info.file_size
		this.res_size += info.res_size
	}

	remove(info: this) {
		this.file_count -= info.file_count
		this.file_size -= info.file_size
		this.res_size -= info.res_size
	}

	sum(items: this[]): void {
		this.file_count = 0
		this.file_size = 0
		this.res_size = 0
		for (const item of items) {
			this.add(item)
		}
	}
}
