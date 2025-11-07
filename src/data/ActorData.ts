import { PostData } from "./PostData";
import ActorFileDetail from "./FileInfo";
import { ActorVideoInfo } from "./ActorVideoInfo";
import BaseData from "./BaseData";
import { ROOT_URL } from "./Consts";
import { IActor } from "./Schemas";


export default class ActorData extends BaseData {
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
	file_info: ActorFileDetail
	video_infos: ActorVideoInfo[]
	folder_ids: number[]

	get icon_url() {
		if (this.icon?.startsWith('http')) {
			return this.icon;
		}
		return `${ROOT_URL}/${this.icon}`
	}

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
		return this.file_info && this.file_info.is_completed
	}

	get post_desc() {
		if (this.file_info.unfinished_post_count > 0) {
			return `[${this.file_info.finished_post_count}(+${this.file_info.unfinished_post_count})/${this.file_info.total_post_count}]`
		} else {
			return `[${this.file_info.finished_post_count}/${this.file_info.total_post_count}]`
		}
	}

	get thumbnail_desc() {
		return `(${this.file_info.thumbnail_count}P)`
	}

	get show_score() {
		return this.score / 2
	}

	set show_score(val: number) {
		this.score = val * 2
	}

	get has_remark() {
		return (this.remark !== "")
			|| (this.comment !== "")
			|| this.commented_posts.length > 0
	}

	get has_video_info() {
		return this.video_infos.length > 0
	}

	get str_video_infos(): string {
		let landscape_duration = 0
		let portrait_duration = 0
		for (const info of this.video_infos) {
			if (info.is_landscape) {
				landscape_duration += info.duration
			} else {
				portrait_duration += info.duration
			}
		}
		landscape_duration = Math.floor(landscape_duration / 60)
		portrait_duration = Math.floor(portrait_duration / 60)
		return `${landscape_duration}m | ${portrait_duration}m`
	}

	constructor(json_data?: IActor) {
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

	refreshPostComment(post_id: string, comment: string) {
		const post_index = this.commented_posts.findIndex(post => post.post_id == post_id)
		if (post_index != -1) {
			if (comment.length > 0) {
				this.commented_posts[post_index].comment = comment
			} else {
				this.commented_posts.splice(post_index, 1)
			}
		} else {
			if (comment.length > 0) {
				const postData = new PostData()
				postData.post_id = post_id
				postData.comment = comment
				this.commented_posts.push(postData)
			}
		}
	}
}