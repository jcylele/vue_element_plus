import BaseData from "./BaseData"

export default class DownloadingVideoStats extends BaseData {
	actor_id: number = 0
	actor_name: string = ""
	file_count: number = 0
	file_size: number = 0
	res_size: number = 0

	get percent(): number {
		return this.file_size / this.res_size
	}

	constructor(json_data?: Record<string, any>) {
		// 1. 先调用super()，完成父类的初始化
		super()
		if (json_data) {
			// 2. 在属性默认值设置好后，再用json_data来覆盖
			Object.assign(this, json_data)
		}
	}

	static getTotal(list: DownloadingVideoStats[]): DownloadingVideoStats {
		const total = list.reduce((acc, cur) => {
			acc.add(cur)
			return acc
		}, new DownloadingVideoStats())
		total.actor_name = "Total"
		return total
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