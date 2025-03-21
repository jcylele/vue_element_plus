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

export class BaseResult extends EditableData {
    succeed: boolean
    msg: string

    constructor(json_data?) {
        super(json_data);
    }
}


export class ActorResult extends BaseResult {
    actor: ActorData

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

export class ActorListResult extends BaseResult {
    // actor_list: ActorData[]   server data
    actor_map: Map<number, ActorData>

    constructor(json_data?) {
        super(json_data);
        if (!json_data) {
            return
        }
        this.actor_map = new Map<number, ActorData>()
        for (const json_obj of json_data.actor_list) {
            const actor = new ActorData(json_obj)
            this.actor_map.set(actor.actor_id, actor)
        }
    }
}
