import ActorTagData from "./ActorTagData";

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