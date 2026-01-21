import { ActorLogType, GroupCondType, NoticeType, ResState } from "./Enums"

export interface IPost {
	post_id: string
	comment: string
}

export interface INotice {
	notice_id: number
	notice_type: NoticeType
	notice_param0: string
	notice_param1: string
	notice_param2: string
	notice_param3: string
}

export interface IActorLog {
	log_type: ActorLogType
	log_param: string
	log_time: string
}


export interface IActorGroupCond {
	cond_type: GroupCondType
	cond_param: number
}


export interface IActorGroup {
	group_id: number
	group_name: string
	group_desc: string
	group_color: string
	flags: number
	group_priority: number

	cond_list: IActorGroupCond[]
}


export interface IActorFileInfo {
	actor_id: number
	res_state: ResState
	img_size: number
	video_size: number
	img_count: number
	video_count: number
}


export interface IActorTag {
	tag_id: number
	tag_name: string
	tag_priority: number
	tag_group_id: number
}

export interface IActorTagFull extends IActorTag {
	used_count: number
	avg_score: number
}

export interface IActorTagGroup {
	group_id: number
	group_name: string
	group_desc: string
	group_priority: number
}

export interface IFavoriteFolder {
	folder_id: number
	folder_name: string
	folder_desc: string
	folder_priority: number
}

export interface IActorMain {
	score: number
	remark: string
	tag_ids: number[]
}

export interface IActor extends IActorMain {
	actor_id: number
	actor_name: string
	actor_platform: string
	actor_group_id: number
	comment: string

	is_linked: boolean
	has_last_post_id: boolean
	folder_ids: number[]
	commented_posts: IPost[]

	score: number
	remark: string
	tag_ids: number[]

	icon: string
	href: string
}
