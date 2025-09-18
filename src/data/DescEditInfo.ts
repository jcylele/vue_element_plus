import ActorData from "./ActorData"

export enum EditType {
	REMARK = 0,
	COMMENT = 1,
}

interface IDescStaticInfo {
	title: string
	root_class: string
}

const RemarkStaticInfo: IDescStaticInfo = {
	title: "Remark(shared)",
	root_class: "remark-root"
}

const CommentStaticInfo: IDescStaticInfo = {
	title: "Comment(single)",
	root_class: "comment-root"
}

export class DescEditInfo {
	edit_id: EditType
	config: IDescStaticInfo
	data: string
	is_editing: boolean

	constructor(edit_id: EditType) {
		this.edit_id = edit_id
		this.config = edit_id === EditType.REMARK ? RemarkStaticInfo : CommentStaticInfo
		this.data = ""
		this.is_editing = false
	}

	startEdit() {
		this.is_editing = true
	}

	reset(actor_data: ActorData) {
		this.data = this.edit_id === EditType.REMARK ? actor_data.remark : actor_data.comment
		this.is_editing = false
	}

}