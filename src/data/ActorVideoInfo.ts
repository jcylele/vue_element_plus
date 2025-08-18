import BaseData from "./BaseData"
import { format_duration, format_file_size_gb } from "./DataUtil"

export class ActorVideoInfo extends BaseData {
	readonly is_landscape: boolean
	readonly duration: number
	readonly file_count: number
	readonly file_size: number

	get str_duration() {
		return format_duration(this.duration)
	}

	get str_file_size() {
		return format_file_size_gb(this.file_size)
	}

	get str_resolution(): string {
		if (this.is_landscape) {
			return "landscape"
		} else {
			return "portrait"
		}
	}

	get str_file_count() {
		return `${this.file_count}V`
	}
}