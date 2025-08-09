import { ActorPostInfo } from "./WebData";
import BaseData from "./BaseData";

export class PostFilterForm {
    actor_id: number
    post_id_prefix: string
    has_comment: boolean
    comment: string
}

export class PostConditionForm {
    init_actor: ActorPostInfo
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

    constructor(init_actor_info: ActorPostInfo) {
        this.init_actor = init_actor_info
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
        const init_actor_id = this.init_selected ? this.init_actor.actor_id : 0
        return this.createFilterForm(init_actor_id)
    }
}

export class PostData extends BaseData {
    post_id: string
    comment: string
    is_editing: boolean
}