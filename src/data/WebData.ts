import ActorTagData from "./ActorTagData";
import EditableData from "./EditableData";
import ActorData from "./ActorData";

interface ITagEditInfo {
    tag: ActorTagData,
    is_editing: boolean,
}

/**
 * props 不支持 interface类型定义，只能这么包一层
 */
export class TagEditInfo implements ITagEditInfo {
    tag: ActorTagData
    is_editing: boolean
}

export class ActorPostInfo extends EditableData {
    actor_id: number
    actor_name: string
    post_count: number
}


export class ActorResult extends EditableData {
    succeed: boolean
    actor: ActorData
    msg: string

    constructor(json_data?) {
        super(json_data);
        if (!json_data) {
            return
        }
        if (json_data.actor) {
            this.actor = new ActorData(json_data.actor)
        }
    }
}
