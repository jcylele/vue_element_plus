import BaseData from "./BaseData"

export class ResFileInfo extends BaseData {
	file_path: string = ""
	file_size: number = 0
	res_size: number = 0

	get percent(): number {
		return this.file_size / this.res_size
	}

	add(info: ResFileInfo) {
		this.file_size += info.file_size
		this.res_size += info.res_size
	}

	constructor(json_data?: Record<string, any>) {
		super()
		if (json_data) {
			Object.assign(this, json_data)
		}
	}

	static getTotal(list: ResFileInfo[]): ResFileInfo {
		const total = list.reduce((acc, cur) => {
			acc.add(cur)
			return acc
		}, new ResFileInfo())
		total.file_path = `Total(${list.length})`
		return total
	}
}
