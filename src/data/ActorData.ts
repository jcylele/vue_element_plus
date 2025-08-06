import EditableData from "./EditableData";
import { PostData } from "./PostData";
import { ResState } from "./Enums";
import ActorFileStats from "./FileInfo";
import { ActorVideoInfo } from "./WebData";


export default class ActorData extends EditableData {
	actor_id: number
	actor_name: string
	actor_platform: string
	actor_group_id: number
	score: number
	icon: string
	href: string
	is_linked: boolean
	comment: string
	remark: string
	commented_posts: PostData[]
	tag_ids: number[]
	file_info: ActorFileStats
	video_infos: ActorVideoInfo[]
	folder_ids: number[]

	get fav_count() {
		return this.folder_ids.length
	}

	get in_fav_folder() {
		return this.folder_ids.length > 0
	}

	addToFolder(folder_id: number) {
		const folder_index = this.folder_ids.indexOf(folder_id)
		if (folder_index == -1) {
			this.folder_ids.push(folder_id)
		}
	}

	removeFromFolder(folder_id: number) {
		const folder_index = this.folder_ids.indexOf(folder_id)
		if (folder_index != -1) {
			this.folder_ids.splice(folder_index, 1)
		}
	}

	get is_video_all() {
		if (!this.file_info) {
			return false
		}
		if (this.file_info.total_post_count == 0) {
			return false
		}
		if (this.file_info.finished_post_count < this.file_info.total_post_count) {
			return false
		}
		for (const resFileInfo of this.file_info.res_info) {
			if ((resFileInfo.res_state == ResState.Skip
				|| resFileInfo.res_state == ResState.Init)
				&& resFileInfo.video_count > 0) {
				return false
			}
		}

		return true
	}

	get post_desc() {
		if (this.file_info.unfinished_post_count > 0) {
			return `[${this.file_info.finished_post_count}(+${this.file_info.unfinished_post_count})/${this.file_info.total_post_count}]`
		} else {
			return `[${this.file_info.finished_post_count}/${this.file_info.total_post_count}]`
		}
	}

	get show_score() {
		return this.score / 2
	}

	set show_score(val: number) {
		this.score = val * 2
	}

	get has_remark() {
		return (this.remark !== "") || (this.comment !== "") || this.commented_posts.length > 0
	}

	constructor(json_data?) {
		super(json_data);

		// default values for specific fields
		this.tag_ids ??= []
		this.commented_posts = []
		this.video_infos = []

		if (!json_data) {
			return
		}

		for (const jsonDatum of json_data.commented_posts) {
			this.commented_posts.push(new PostData(jsonDatum))
		}
	}

	sortTags(compareFn?: (a: number, b: number) => number) {
		this.tag_ids.sort(compareFn)
	}

	hasTag(tag_id: number) {
		return this.tag_ids.indexOf(tag_id) >= 0
	}
}