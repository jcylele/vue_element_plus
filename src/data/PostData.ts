import EditableData from "./EditableData";


export class PostConditionForm {
    fixed_actor_name: string
    actor_name: string
    post_id_prefix: string
    has_comment: boolean
    private _is_editing: boolean

    get is_editing() {
        return this._is_editing
    }

    /**
     * start or finish editing, finish may fail(inner val not changed)
     */
    set is_editing(val: boolean) {
        if (this._is_editing == val) {
            return
        }
        if (val) {
            this.actor_name = this.fixed_actor_name || ""
        } else {
            if (this.post_id_prefix.length < this.calcMinPrefixLength()) {
                return
            }
        }
        this._is_editing = val
    }

    get has_actor_name(){
        return this.actor_name != ""
    }

    calcMinPrefixLength(): number {
        if (this.has_comment) {
            return 0
        }
        if (this.actor_name.length > 0) {
            return 3
        }
        return 5
    }

    constructor(_fixed_actor_name?) {
        this.fixed_actor_name = _fixed_actor_name
        this.actor_name = _fixed_actor_name || ""
        this.post_id_prefix = ""
        this.has_comment = false
        this._is_editing = true
    }
}


export class PostCommentForm {
    post_id: number
    comment: string
}

export class PostData extends EditableData {
    post_id: number
    actor_name: string
    completed: boolean
    comment: string
    is_editing: boolean
}