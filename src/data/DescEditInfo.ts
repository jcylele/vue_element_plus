import { ActorData } from "./ActorData"

export enum EditType {
	REMARK = 0,
	COMMENT = 1,
}

export class DescEditInfo {
	edit_id: EditType
	data: string
	is_editing: boolean

	constructor(edit_id: EditType) {
		this.edit_id = edit_id
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