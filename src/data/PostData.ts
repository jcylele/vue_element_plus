import BaseData from "./BaseData";
import { EditingData }from "./EditingData";

export class ActorPostInfo extends BaseData {
	readonly actor_id: number
	readonly actor_name: string
	readonly post_count: number
}

export class PostFilterForm {
    actor_id: number
    post_id_prefix: string
    has_comment: boolean
    comment: string
}

export class PostConditionForm {
    init_actor_id: number
    init_selected: boolean
    post_id_prefix: string
    has_comment: boolean
    comment: string
    is_editing: boolean

    calcMinPrefixLength(): number {
        if (this.has_comment || this.comment.trim().length > 0) {
            return 0
        }
        if (this.init_selected) {
            return 3
        }
        return 5
    }

	checkPostIdPrefix(): boolean {
		if (this.post_id_prefix.length < this.calcMinPrefixLength()) {
			return false
		}
		return true
	}

    constructor(init_actor_id = 0) {
        this.init_actor_id = init_actor_id
        this.init_selected = true
        this.post_id_prefix = ""
        this.has_comment = false
        this.comment = ""
        this.is_editing = true
    }

    createFilterForm(actor_id: number): PostFilterForm {
        let form = new PostFilterForm()
        form.actor_id = actor_id
        form.post_id_prefix = this.post_id_prefix
        form.has_comment = this.has_comment
        form.comment = this.comment.trim()
        return form
    }

    createInitForm(): PostFilterForm {
        const init_actor_id = this.init_selected ? this.init_actor_id : 0
        return this.createFilterForm(init_actor_id)
    }
}

export class PostData extends BaseData {
    post_id: string
    comment: string
	editing_comment: string

	constructor(json_data?: Record<string, any>) {
		super(json_data)
		this.editing_comment = this.comment
	}
}

export class EditingPostData extends EditingData<PostData> {
	constructor(json_data?: Record<string, any>) {
		super(new PostData(json_data))
	}
}