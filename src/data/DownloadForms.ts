/**
 * DownloadForms is the forms for the download operations.
 */

import { BaseData } from "./BaseData";
import { mb_size } from "./DataUtil";
import { PostFilter, ResType } from "./Enums";

export class BaseBatchActor {
    actor_ids: number[]
}

export class ActorUrl {
	actor_name: string
	full_url: string

	constructor() {
		this.actor_name = ""
		this.full_url = ""
	}
}

export class BaseDownloadForm {
	download_limit: DownloadLimitForm
}

export class SpecificDownloadForm extends BaseDownloadForm {
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

export class FixVideoForm extends BaseBatchActor {
    end_date: string
}

export class DownloadLimitForm extends BaseData {
	actor_count: number

	post_count: number
	post_filter: PostFilter

	res_type: ResType
	file_count: number
	total_file_size: number
	single_file_size_min: number
	single_file_size_max: number


	get show_single_file_size_min() {
		return this.single_file_size_min / (mb_size)
	}

	set show_single_file_size_min(val: number) {
		this.single_file_size_min = val * (mb_size)
	}

	get show_single_file_size_max() {
		return this.single_file_size_max / (mb_size)
	}

	set show_single_file_size_max(val: number) {
		this.single_file_size_max = val * (mb_size)
	}

	get show_total_file_size() {
		return this.total_file_size / (mb_size)
	}

	set show_total_file_size(val: number) {
		this.total_file_size = val * (mb_size)
	}

	setSingleSizeRange(minVal: number, maxVal: number) {
		this.single_file_size_min = minVal * (mb_size)
		this.single_file_size_max = maxVal * (mb_size)
	}

	setPresetValue(preset) {
		this.actor_count = preset.actor_count
		this.post_count = preset.post_count
		this.file_count = preset.file_count
		this.show_total_file_size = preset.show_total_file_size
		this.show_single_file_size_min = preset.show_single_file_size_min ?? 0
		this.show_single_file_size_max = preset.show_single_file_size_max ?? 0
	}
}
