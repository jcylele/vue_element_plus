import ActorTagData from "./ActorTagData";
import EditableData from "./EditableData";

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