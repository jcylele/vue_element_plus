import { PostFilter, ResType } from "./Enums";
import { mb_size } from "./DataUtil";

export class ActorUrl {
	actor_name: string
	full_url: string
}

export class BaseDownloadForm {
	download_limit: DownloadLimitForm
}

export class ActorIdDownloadForm extends BaseDownloadForm {
	actor_ids: number[]
}

export class GroupDownloadForm extends BaseDownloadForm {
	actor_group_id: number
}

export class NewDownloadForm extends GroupDownloadForm {
	start_page: number
}

export class UrlDownloadForm extends GroupDownloadForm {
	urls: ActorUrl[]
}

export class DownloadLimitForm {
	actor_count: number

	post_count: number
	post_filter: PostFilter

	res_type: ResType
	file_count: number
	total_file_size: number
	single_file_size: number = 0


	constructor(json_data?) {
		Object.assign(this, json_data)
	}

	get show_single_file_size() {
		return this.single_file_size / (mb_size)
	}

	set show_single_file_size(val: number) {
		this.single_file_size = val * (mb_size)
	}

	get show_total_file_size() {
		return this.total_file_size / (mb_size)
	}

	set show_total_file_size(val: number) {
		this.total_file_size = val * (mb_size)
	}

	setSingleSize(val: number) {
		this.single_file_size = val * (mb_size)
	}

	setPresetValue(preset) {
		this.actor_count = preset.actor_count
		this.post_count = preset.post_count
		this.file_count = preset.file_count
		this.show_total_file_size = preset.show_total_file_size
		this.show_single_file_size = preset.show_single_file_size
	}
}
