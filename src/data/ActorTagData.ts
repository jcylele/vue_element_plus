import EditableData from "./EditableData";
import {ISortItem} from "./Interfaces";

export default class ActorTagData extends EditableData implements ISortItem {
    readonly tag_id: number
    tag_name: string
    tag_priority: number
    used_count: number

    constructor(json_data?) {
        super(json_data);
    }

    get key(): number {
        return this.tag_id
    }

    get priority(): number {
        return this.tag_priority
    }
}